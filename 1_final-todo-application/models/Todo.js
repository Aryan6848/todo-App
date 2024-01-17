const mongoose= require("mongoose");

const todoSchema= new mongoose.Schema({
    userId:String,
    todoText:String,
    completed:Boolean,
    id: Number,
});

const Todo =mongoose.model("Todo",todoSchema);//Todo namm se schema bn jaegi 

module.exports =Todo;