import mongoose, { Schema } from "mongoose";

const sparePartsSchema = new mongoose.Schema({
    category: {
        type: Schema.Types.ObjectId,
        ref:'SPC',
        required: true
    },
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
    status: {
        type: Number,
        required: true
    },
    deletedAt: {
        type: Date,
        default: null
    }
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('SP', sparePartsSchema);
