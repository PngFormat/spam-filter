const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';

const generateAuthToken = (user) => {
    const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
    return token;
};

module.exports = generateAuthToken;