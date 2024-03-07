const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET_KEY || 'default-secret-key';

const generateAuthToken = (user) => {
    try {
        const token = jwt.sign({ userId: user._id }, secretKey, { expiresIn: '1h' });
        return token;
    } catch (error) {
        console.error('Error generating auth token:', error);
        throw new Error('Failed to generate auth token');
    }
};
module.exports = generateAuthToken;