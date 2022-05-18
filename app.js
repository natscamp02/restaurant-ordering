const path = require('path');
const express = require('express');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const { flash } = require('express-flash-message');

const userRouter = require('./routes/userRouter');
const menuRouter = require('./routes/menuRouter');
const ordersRouter = require('./routes/ordersRouter');

const app = express();

// Setting up view templates
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// Serving static files
app.use(express.static(path.join(__dirname, 'public')));

// Body and cookie parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session
app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: true,
		saveUninitialized: false,
		cookie: {
			maxAge: 1000 * 60 * 60,
			secure: process.env.NODE_ENV === 'production',
		},
	})
);

// Showing flash messages
app.use(flash());

// Setting up routes
app.use('/users', userRouter);
app.use('/menu', menuRouter);
app.use('/orders', ordersRouter);

app.get('/', (req, res) => {
	res.render('home');
});

// Error handling
app.all('*', (req, res, next) => {
	next(new Error('Cannot find ' + req.originalUrl));
});
app.use((err, req, res, next) => {
	console.log(err.message);

	res.redirect('/');
});

module.exports = app;
