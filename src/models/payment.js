import mongoose,{ Schema } from "mongoose";
const productSchema = new Schema({
    car_id: {
        type: Schema.Types.ObjectId,
        ref: 'Car',
        required: function() {
            return !this.sps_id;
        },
    },
    sps_id: {
        type: Schema.Types.ObjectId,
        ref: 'SP',
        required: function() {
            return !this.car_id;
        },
    },
    qty: {
        type: Number,
        required: true,
        min: 1 
    },
}, { _id: false }); 
const paymentSchema =  new Schema({
    paymentId:{
        type:String,
        required:true
    },
    userId:{
        type:Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    products:[productSchema],
    status:{
        type:String,
        required:true
    },
    amount:{
        type:Number,
        required:true
    },
    currency:{
        type:String,
        required:true
    }
},{
    timestamps:true,
    versionKey:false
})

export default mongoose.model('Payment',paymentSchema)