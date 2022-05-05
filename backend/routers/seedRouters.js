import express from 'express';
import Product from '../models/productModel.js';
import data from '../data.js';

const seedRouter = express.Router();

seedRouter.get('/', async (req, res) => {
    await Product.deleteMany({});
    const createProducts = await Product.insertMany(data.products);
    res.send({ createProducts });
});

export default seedRouter;