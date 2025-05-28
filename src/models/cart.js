import mongoose, { Schema } from 'mongoose';

const cartSchema = new Schema({
    product_id: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    qty: {
        type: Number,
        required: true,
        min: 1 
    },
    user_id:{
        type:Schema.Types.ObjectId,
        ref:'User',
        required:true
    },
}, { timestamps: true }); 


export default mongoose.model('Cart', cartSchema);
