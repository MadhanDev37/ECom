import mongoose, { Schema } from "mongoose";

const sparePartsCategoriesSchema = new mongoose.Schema({
    name: {
        type: String,
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

export default mongoose.model('SPC', sparePartsCategoriesSchema);
