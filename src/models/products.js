import mongoose, { Schema } from "mongoose";

const productSchema = new mongoose.Schema({
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
    qty: {
        type: Number,
        required: true
    },
    images: {
        type: [String], 
        required: true
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

export default mongoose.model('Product', productSchema);
