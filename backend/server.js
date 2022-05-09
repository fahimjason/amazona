import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routers/seedRouters.js';
import productRouter from './routers/productRouters.js';
import userRouter from './routers/userRoutes.js';
import orderRouter from './routers/orderRoutes.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to Database.');
    })
    .catch(err => console.log(err.message));

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/key/paypal', async (req, res) => {
    res.send(process.env.PAYPAL_CLIENT_ID || 'sb');
});

app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);
app.use('/api/users', userRouter);
app.use('/api/orders', orderRouter);

app.use((err, req, res, next) => {
    res.status(500).send({ message: err.message });
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`serve at http://localhost:${port}`);
});