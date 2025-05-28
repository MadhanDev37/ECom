import mongoose, { Schema } from "mongoose";

const brandSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    images: {
        type: [String], 
        required: true
    },
    category_id:{
        type:Schema.Types.ObjectId,
        ref:'Categories',
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

export default mongoose.model('Brand', brandSchema);
