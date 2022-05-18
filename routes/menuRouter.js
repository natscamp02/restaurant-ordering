const express = require('express');
const conn = require('../db');

const router = express.Router();

// Shows all dishes
router.get('/', (req, res, next) => {
	conn.query('SELECT * from menu ORDER BY id', (err, results) => {
		if (err || results.length <= 0) return res.redirect('/');

		let message = '';
		if (req.query.order) {
			switch (req.query.order) {
				case 'success':
					message = 'Order created successfully!';
					break;
				case 'fail':
					message = 'Failed to create order!';
					break;

				default:
					message = '';
					break;
			}
		}

		res.status(200).render('menu', {
			items: results,
			message,
		});
	});
});

module.exports = router;
