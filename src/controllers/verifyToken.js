const jwt = require('jsonwebtoken');

const config = require('../config');

function verifyToken(req, res, next) {
	try {
		const token = req.headers['x-access-token'];
		if (!token) {
			return res.status(404).json({
				auth: false,
				message: 'No token provided',
			});
		}
		const decoded = jwt.verify(token, config.secret);
		req.userId = decoded.id;
		next();
	} catch (error) {
		return res.status(401).json({
			auth: false,
			message: 'No autentication',
		});
	}
}

module.exports = verifyToken;
