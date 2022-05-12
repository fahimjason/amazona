import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
    const { _id, name, email, isAdmin } = user;
    const userData = {
        _id,
        name,
        email,
        isAdmin
    };

    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30d' });
};

export const isAuth = (req, res, next) => {
    const authorization = req.headers.authorization;

    if (authorization) {
        const token = authorization.slice(7, authorization.length); // Bearer XXXXXX

        jwt.verify(token, process.env.JWT_SECRET, (err, decode) => {
            if (err) {
                res.status(401).send({ message: 'Invalid Token' });
            } else {
                req.user = decode;
                next();
            }
        });
    } else {
        res.status(401).send({ message: 'No Token' });
    }
};

export const isAdmin = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        next();
    } else {
        res.status(401).send({ message: 'Invalid Admin Token' });
    }
};