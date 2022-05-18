const express = require('express');
const createError = require('http-errors');
const { restrictFields } = require('../utils');
const conn = require('../db');

const router = express.Router();

router.get('/', (req, res) => {
	if (req.session.user) res.redirect('/orders');
	else res.redirect('/users/login');
});

// Shows login form
router.get('/login', (req, res) => {
	res.render('auth/login');
});

// Logs an admin in
router.post('/login', (req, res, next) => {
	const data = restrictFields(req.body, 'username', 'password');

	conn.query('SELECT * FROM users WHERE username = ? AND password = ?', Object.values(data), (err, [user]) => {
		if (err || !user) return next(createError(402, 'Incorrect username or password'));

		req.session.user = user;
		res.redirect('/orders');
	});
});

// Logs user out
router.get('/logout', (req, res, next) => {
	req.session.destroy();
	res.redirect('/');
});

module.exports = router;
