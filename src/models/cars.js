import mongoose, { Schema } from "mongoose";

const carSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
   
    price: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    images: {
        type: [String], 
        required: true
    },
    status:{
        type:Number,
        required:true
    },
    brand:{
        type:Schema.Types.ObjectId,
        ref:'Brand',
        required:true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('Car', carSchema);
