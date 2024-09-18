const catchAsyncError = require('../middlewares/catchAsyncError');
const Product = require('../models/productModel');
const APIFeatures = require('../utils/apiFeatures');
const ErrorHandler = require('../utils/errorHandler');

/* get method urlPath --> /api/v1/products */
/* get all products */
exports.getProducts = catchAsyncError( async (req, res, next) => {
   const resPerPage = 2;
   const apiFeatures = new APIFeatures(Product.find(), req.query).search().filter().paginate(resPerPage);
   const products = await apiFeatures.query;
   res.status(200).json({
      success: true,
      count: products.length,
      products
   });
});

/* post method urlPath --> /api/v1/product/new */
/* create product */
exports.newProduct = catchAsyncError( async (req, res, next) => {
   req.body.user = req.user
   const product = await Product.create(req.body);
   res.status(201).json({
      success: true,
      product
   });
}); 

/* get method urlPath --> /api/v1/product/:id */
/* get single product */
exports.getSingleProduct = catchAsyncError( async (req, res, next) => {
   const product = await Product.findById(req.params.id);
   if(!product) return next (new ErrorHandler('Product not found...', 400));
   res.status(200).json({
      success: true,
      product
   });
}); 

/* put method urlPath --> /api/v1/product/:id */
/* update product */
exports.updateProduct = catchAsyncError( async (req, res, next) => {
   let product = await Product.findById(req.params.id);
   if(!product) {
      return res.status(404).json({
         success: false,
         message: "Product not found..." 
      });
   };
   product = await Product.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
   });
   res.status(200).json({
      success: true,
      product
   });
});

/* delete method urlPath --> /api/v1/product/:id */
/* delete product */
exports.deleteProduct = catchAsyncError( async (req, res, next) => {
   let product = await Product.findById(req.params.id);
   if(!product) {
      return res.status(404).json({
         success: false,
         message: "Product not found..." 
      });
   };
   await product.deleteOne();
   res.status(200).json({
      success: true,
      message: "Product deleted...!"
   });
});