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