import mongoose from "mongoose";

const userDataSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    gender:{
        type:String,
        default:null
    },
    mobile: {
        type: Number,
        default:null,
        min: 1000000000,
        max: 9999999999 
    },
    address: {
        street: { type: String,default:null, },
        city: { type: String,default:null, },
        state: { type: String,default:null, },
        country: { type: String,default:null, }
      },
    pincode: {
        type: Number,
        default:null,
        min: 100000,  
        max: 999999   
    }
}, { _id: false });

const productSchema = new mongoose.Schema({
    product_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    qty: {
        type: Number,
        required: true,
        min: 1
    }
}, { _id: false });

const orderSchema = new mongoose.Schema({
    user: userDataSchema,
    products: [productSchema]
}, {
    timestamps: true,
    versionKey: false
});

export default mongoose.model('Order', orderSchema);
