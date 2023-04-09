const { Schema, model, ObjectId } = require("mongoose")
const { isEmail } = require("validator")
const logger = require("../services/log")
const bcrypt = require("bcrypt")

const  otpSchema = new Schema({

    email:String,
    code:String,
    expireIn:Number

},{
    timestamps: true
});

let otp = model('otp', otpSchema);

module.exports = otp;