const mongoose= require("mongoose");

const userSchema = new mongoose.Schema({
    username:String,
    password:String,
    profilePic:String,
});

const User =mongoose.model("User",userSchema);//User namm se schema bn jaegi 

module.exports =User;