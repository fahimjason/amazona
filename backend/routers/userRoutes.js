import express from 'express';
import bcrypt from 'bcryptjs';
import expressASyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { generateToken, isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const userRouter = express.Router();

userRouter.post('/signin', expressASyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const { _id, name, email, password, isAdmin } = user;

    if (user) {
        if (bcrypt.compareSync(req.body.password, password)) {
            res.send({
                _id,
                name,
                email,
                isAdmin,
                token: generateToken(user),
            });

            return;
        }
        res.status(401).send({ message: 'Invalid email or password' });
    }
}));

userRouter.post('/signup', expressASyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const newUser = new User({
        name,
        email,
        password: bcrypt.hashSync(password)
    });

    const user = await newUser.save();
    const { _id, name: Name, email: Email, isAdmin } = user;

    res.send({
        _id,
        name: Name,
        email: Email,
        isAdmin,
        token: generateToken(user),
    });
}));

userRouter.put('/profile', isAuth, expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        if (password) {
            user.password = bcrypt.hashSync(password, 8);
        }

        const updatedUser = await user.save();

        res.send({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            token: generateToken(updatedUser),
        });
    } else {
        res.status(404).send({ message: 'User not found' });
    }
}));

export default userRouter;