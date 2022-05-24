import express from 'express';
import bcrypt from 'bcryptjs';
import expressASyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { generateToken, isAdmin, isAuth } from '../utils.js';
import expressAsyncHandler from 'express-async-handler';

const userRouter = express.Router();

userRouter.get('/', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const users = await User.find({});
    res.send(users);
}));

userRouter.get('/top-sellers', expressAsyncHandler(async (req, res) => {
    const topSellers = await User.find({ isSeller: true }).sort({ 'seller.rating': -1 }).limit(3);

    res.send(topSellers);
}));

userRouter.get('/seller/:id', expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        res.send(user);
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}));

userRouter.get('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        res.send(user);
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}));

userRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        if (user.email === 'admin@example.com') {
            res.status(400).send({ message: 'Can Not Delete Admin User' });
            return;
        }
        await user.remove();
        res.send({ message: 'User Deleted' });
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}));

userRouter.post('/signin', expressASyncHandler(async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const { _id, name, email, password, isAdmin, isSeller } = user;

    if (user) {
        if (bcrypt.compareSync(req.body.password, password)) {
            res.send({
                _id,
                name,
                email,
                isAdmin,
                isSeller,
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
    const { _id, name: Name, email: Email, isAdmin, isSeller } = user;

    res.send({
        _id,
        name: Name,
        email: Email,
        isAdmin,
        isSeller,
        token: generateToken(user),
    });
}));

userRouter.put('/profile', isAuth, expressAsyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const user = await User.findById(req.user._id);

    if (user) {
        user.name = name || user.name;
        user.email = email || user.email;
        if (user.isSeller) {
            user.seller.name = req.body.sellerName || user.seller.name;
            user.seller.logo = req.body.sellerLogo || user.seller.logo;
            user.seller.description = req.body.sellerDescription || user.seller.description;
        }
        if (password) {
            user.password = bcrypt.hashSync(password, 8);
        }

        const updatedUser = await user.save();

        res.send({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            isAdmin: updatedUser.isAdmin,
            isSeller: updatedUser.isSeller,
            token: generateToken(updatedUser),
        });
    } else {
        res.status(404).send({ message: 'User not found' });
    }
}));

userRouter.put('/:id', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        user.name = req.body.name || user.name;
        user.email = req.body.email || user.email;
        user.isAdmin = Boolean(req.body.isAdmin);
        user.isSeller = Boolean(req.body.isSeller);
        const updatedUser = await user.save();
        res.send({ message: 'User Updated', user: updatedUser });
    } else {
        res.status(404).send({ message: 'User Not Found' });
    }
}));

export default userRouter;