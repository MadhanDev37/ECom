import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema= new Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    role:{
        type:Number,
        required:true
    },
    status: {
        type: Number,  
        default: 0,
        required: true
    },
    deletedAt:{
       type:Date,
       default:null 
    }
},{timestamps:true,versionKey:false})

export default mongoose.model('User',userSchema);