const catchAsyncError = require("../middlewares/catchAsyncError");
const User = require('../models/userModel');
const sendEmail = require("../utils/email");
const ErrorHandler = require("../utils/errorHandler");
const sendToken = require("../utils/jwt");
const crypto = require('crypto');

/* post method --> urlPath --> /api/v1/register */
/* register user */
exports.registerUser = catchAsyncError( async (req, res, next) => {
   const {name, email, password, avatar} = req.body;
   const user = await User.create({
      name,
      email,
      password,
      avatar
   });
   sendToken(user, 201, res);
});

/* post method --> urlPath --> /api/v1/login */
/* login user */
exports.loginUser = catchAsyncError( async (req, res, next) => {
   const {email, password} = req.body;
   if(!email || !password) return next (new ErrorHandler('please enter email & password...', 400));
   /* finding the user database */
   const user = await User.findOne({email}).select('+password');
   if(!user) return next (new ErrorHandler('Invalid email or password...', 401));
   if(!await user.isValidPassword(password)) return next (new ErrorHandler('Invalid email or password...', 401));
   sendToken(user, 200, res);
});

/* get method --> urlPath --> /api/v1/logout */
/* logout user */
exports.logoutUser = catchAsyncError( async (req, res, next) => {
   res.cookie('token',null, {
       expires: new Date(Date.now()),
       httpOnly: true
   }).status(200).json({
       success: true,
       message: "Loggedout"
   });
});

/* post method --> urlPath --> /api/v1/password/forgot */
/* user forgot password */
exports.forgotPassword = catchAsyncError( async (req, res, next) => {
   const user = await User.findOne({email: req.body.email});
   if(!user) return next (new ErrorHandler('User not found with this email address...', 404));
   /* user reset password token */
   const resetToken = user.getResetToken();
   await user.save({validateBeforeSave: false});
   /* create reset url */
   const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/password/reset/${resetToken}`;
   const message = `Your password reset url is as follows \n\n ${resetUrl} \n\n If you have not requested this email, then ignore it.`;
   try {
      sendEmail({
         email: user.email,
         subject: "Forgot Password",
         message
      });
      res.status(200).json({
         success: true,
         message: `Email send to ${user.email}`
      });
   } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordTokenExpire = undefined;
      await user.save({validateBeforeSave: false});
      return next (new ErrorHandler(error.message, 500));
   };
});

/* post method --> urlPath --> /api/v1/password/reset */
/* user reset password */
exports.resetPassword = catchAsyncError( async (req, res, next) => {
   const resetPasswordToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
   const user = await User.findOne({
      resetPasswordToken,
      resetPasswordTokenExpire: {
         $gt: Date.now()
      }
   });
   if(!user) return next(new ErrorHandler('Password reset token is invalid or expired...'));
   if(req.body.password !== req.body.confirmPassword) next(new ErrorHandler('Password does not match...'));
   user.password = req.body.password;
   user.resetPasswordToken = undefined;
   user.resetPasswordTokenExpire = undefined;
   await user.save({validateBeforeSave: false});
   sendToken(user, 200, res);
});