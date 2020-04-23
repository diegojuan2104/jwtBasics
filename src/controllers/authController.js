const { Router } = require('express');
const router = Router();

const jwt = require('jsonwebtoken');

const User = require('../models/User');

const config = require('../config');

const verifyToken = require('./verifyToken');

router.post('/signup', async (req, res, next) => {
	const { username, email, password } = req.body;
	const user = new User({ username, email, password });
	user.password = await user.encryptPassword(user.password);
	await user.save();

	console.log(user);
	const token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 60 * 60 * 24 });
	res.json({ auth: true, token });
});

router.post('/signin', async (req, res, next) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email: email });
	if (!user) {
		return res.status(404).send('Not found');
	}
	const passwordIsValid = await user.validatePassword(password);
	if (passwordIsValid) {
		return res.status(401).json({
			auth: false,
			token: null,
		});
	} else {
		const token = jwt.sign({ id: user._id }, config.secret, { expiresIn: 60 * 60 * 24 });
		res.status(201).json({
			auth: true,
			token: token,
		});
	}
});

router.get('/me', verifyToken, async (req, res, next) => {
	const user = await User.findById(req.userId, { password: 0 });
	if (!user) {
		return res.status(404).send('User not found');
	}

	res.send(user);
});

module.exports = router;
