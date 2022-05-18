/** Use to filter unsupported fields from an object */
exports.restrictFields = (body, ...allowedFields) => {
	const data = {};

	Object.keys(body).forEach((key) => allowedFields.includes(key) && (data[key] = body[key]));

	return data;
};

/** Middleware for protecting routes */
exports.protect = (req, res, next) => {
	if (!req.session.user) return res.redirect('/users/login');

	next();
};

/** Get random letter */
exports.getNextNumber = (oldNumber) => {
	const [letter, num] = oldNumber.split('-');

	const incremented = String(Number.parseInt(num) + 1);

	return letter + '-' + incremented.padStart(4, '0');
};
