import express from 'express';
import bcrypt from 'bcryptjs';
import expressASyncHandler from 'express-async-handler';
import User from '../models/userModel.js';
import { generateToken } from '../utils.js';

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

export default userRouter;