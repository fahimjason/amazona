import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import seedRouter from './routers/seedRouters.js';
import productRouter from './routers/productRouters.js';

dotenv.config();

const app = express();
app.use('/api/seed', seedRouter);
app.use('/api/products', productRouter);

mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to Database.');
    })
    .catch(err => console.log(err.message));

const port = process.env.PORT || 5000;
app.listen(port, () => {
    console.log(`serve at http://localhost:${port}`);
});