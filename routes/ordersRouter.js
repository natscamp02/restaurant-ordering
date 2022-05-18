const express = require('express');
const { protect, restrictFields, getNextNumber } = require('../utils');
const conn = require('../db');

const router = express.Router();

function createNewOrder(res, dish_id, customer_id, order_code) {
	// 3) Get next order number
	conn.query("SELECT key_val FROM key_control WHERE key_name = 'ORDER_NUM'", (err, vals) => {
		if (err) throw err;

		const orderNumber = getNextNumber(vals[0].key_val);

		// 4) Create new order
		conn.query(
			'INSERT INTO orders (order_number, dish_id, customer_id) VALUES (?, ?, ?)',
			[orderNumber, dish_id, customer_id],
			(err, result) => {
				if (err) throw err;

				res.render('orders/order-result', { order_code });
			}
		);

		// 5) Set new order number
		conn.query("UPDATE key_control SET key_val = '" + orderNumber + "' WHERE key_name = 'ORDER_NUM'", (err) => {
			if (err) console.log(err);
		});
	});
}

// Shows search form
router.get('/find', (req, res) => {
	res.render('orders/search-orders');
});

// Searches for customer's order by the customer's email and code
router.post('/find', (req, res) => {
	const data = restrictFields(req.body, 'email_address', 'order_code');

	conn.query(
		'SELECT ords.*, mn.* FROM orders ords, customers cts, menu mn WHERE ords.customer_id = cts.id AND ords.dish_id = mn.id AND cts.email_address = ? AND cts.order_code = ?',
		Object.values(data),
		(err, orders) => {
			if (err) return res.redirect('/orders/find');

			console.log(orders);

			res.render('orders/customer-orders', { orders });
		}
	);
});

// Show's a form that allows the user to confirm the order
router.get('/confirm/:dish_id', (req, res) => {
	res.render('orders/create-order', { id: req.params.dish_id });
});

// Creates an order with the specified dish and user's email and returns a generated code
router.post('/new/:dish_id', (req, res) => {
	try {
		// 1) Link order to customers
		const data = restrictFields(req.body, 'email_address');

		conn.query('SELECT * FROM customers WHERE BINARY email_address = ?', [data.email_address], (err, customers) => {
			if (err) throw err;

			// If user is not new, use existing customer, otherwise add new customer
			if (customers.length) createNewOrder(res, req.params.dish_id, customers[0].id, customers[0].order_code);
			else {
				// 2) Generate new order code for user
				const code = Date.now().toString().slice(-6);
				conn.query(
					'INSERT INTO customers (email_address, order_code) VALUES (?, ?)',
					[data.email_address.trim(), code],
					(err, result) => {
						if (err) throw err;

						createNewOrder(res, req.params.dish_id, result.insertId, code);
					}
				);
			}
		});
	} catch (err) {
		console.log(err);
		res.redirect('/menu');
	}
});

////////////////////////////////////////////////////////////////
// ADMIN ONLY routes
/////////////////////
router.use(protect);

router.get('/', (req, res, next) => {
	conn.query('SELECT orders.*, menu.dish FROM orders, menu WHERE orders.dish_id = menu.id', (err, results) => {
		if (err) return next(err);

		console.log(results);
		res.render('orders/active-orders', {
			orders: results,
		});
	});
});

router.get('/approve/:id', (req, res, next) => {
	conn.query('UPDATE orders SET orders.confirmed = 1 WHERE orders.id = ' + req.params.id, (err, result) => {
		if (err) {
			console.log(err);
		}

		res.redirect('/orders');
	});
});

router.get('/edit/:id', (req, res, next) => {
	conn.query('SELECT * FROM orders WHERE orders.id = ' + req.params.id, (err, data) => {
		if (err || !data.length) return res.redirect('/orders');

		res.render('orders/edit-form', { order: data[0], dishes: [] });
	});
});

router.post('/update/:id', (req, res, next) => {
	const data = restrictFields(req.body, 'dish_id');

	conn.query(
		'UPDATE orders SET orders.dish_id = ' + data.dish_id + ' WHERE orders.id = ' + req.params.id,
		(err, results) => {
			res.redirect('/orders');
		}
	);
});

// Deletes order
router.get('/delete/:id', (req, res) => {
	conn.query('DELETE FROM orders WHERE id = ' + req.params.id, (err, result) => {
		res.redirect('/orders');
	});
});

module.exports = router;
