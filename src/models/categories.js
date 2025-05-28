import mongoose from "mongoose";
import { Schema } from "mongoose";

const categorySchema= new Schema({
    title:{
        type:String,
        required:true
    },
    deletedAt:{
       type:Date,
       default:null 
    }
},{timestamps:true,versionKey:false})

export default mongoose.model('Categories',categorySchema);