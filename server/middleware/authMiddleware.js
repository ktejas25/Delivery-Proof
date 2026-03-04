const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        console.error('Auth check fail: Token missing on path:', req.path);
        return res.status(401).json({ message: 'Token required' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            console.error('Auth check fail: Token invalid on path:', req.path, 'Error:', err.message);
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.user_type)) {
            console.error('Auth check fail: Role unauthorized on path:', req.path, 'Required:', roles, 'Actual:', req.user.user_type);
            return res.status(403).json({ message: 'Unauthorized role' });
        }
        next();
    };
};

module.exports = {
    authenticateToken,
    authorizeRoles
};
