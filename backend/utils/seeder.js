const connectMongoDb = require('../config/database');
const products = require('../data/products.json');
const Product = require('../models/productModel');
const dotenv = require('dotenv');
dotenv.config({path:'backend/config/config.env'});

connectMongoDb();

const seedProducts = async ()=>{
    try{
        await Product.deleteMany();
        console.log('Products deleted!')
        await Product.insertMany(products);
        console.log('All products added!');
    }catch(error){
        console.log(error.message);
    }
    process.exit();
}

seedProducts();