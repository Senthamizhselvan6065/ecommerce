const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
   name: {
     type: String,
     required: [true, 'Please enter name...']
   },
   email: {
     type: String,
     required: [true, 'Please enter email...'],
     unique: true,
     validate: [validator.isEmail, 'Please enter vaild email address...']
   },
   password: {
     type: String,
     required: [true, 'Please enter password...'],
     maxlength: [6, 'Password cannot exceed 6 characters'],
     select: false
   },
    avatar: {
        type: String
    },
    role :{
        type: String,
        default: 'user'
    },
    resetPasswordToken: String,
    resetPasswordTokenExpire: Date,
    createdAt :{
        type: Date,
        default: Date.now
    }
});

/* hashing password function */
userSchema.pre('save', async function(next) {
   if(!this.isModified('password')){
           next();
       }
   return this.password  = await bcrypt.hash(this.password, 10)
});

/* generate jwt token */
userSchema.methods.getJwtToken = function() {
   return jwt.sign({id: this.id}, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_TIME
   });
};

/* compare password */
userSchema.methods.isValidPassword = async function(enteredPassword) {
   return await bcrypt.compare(enteredPassword, this.password);
};

/* reset password token */
userSchema.methods.getResetToken = function () {
   /* generate token */
   const token = crypto.randomBytes(20).toString('hex');
   //generate Hash and set to resetPasswordToken
   this.resetPasswordToken = crypto.createHash('sha256').update(token).digest('hex');
   /* set token expire time */
   this.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;
   return token;
};

let model =  mongoose.model('User', userSchema);
module.exports = model;