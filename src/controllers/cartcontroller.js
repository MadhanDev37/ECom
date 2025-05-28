import Car from "../models/cars.js";
import Cart from "../models/cart.js";
import Order from "../models/orders.js";
import Payment from "../models/payment.js";
import SP from "../models/spareparts.js";
import Stripe from 'stripe';

import brands from "../models/brands.js";
import products from "../models/products.js";
import categories from "../models/categories.js";
import { mongoose,Types } from "mongoose";


const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const cartAdd = async (req, res, next) => {
    const { prodId, qty } = req.body;

    // console.log('hera rcisf');
    // return;
    
    const userId = req.session.userAuthenticated ? req.session.user._id : null;

    const product = await products.findById(prodId);
  

    if (!product) {
        return res.status(404).json({ message: 'Product not found' });
    }


    // const cartData = userId ? { userId } : { dummy_user_id: sessionId };

    const  cart = await Cart.findOne({user_id:userId,product_id:prodId});

    if (!cart) {

        const cart = new Cart({
          product_id: new Types.ObjectId(prodId),
          qty: qty,
          user_id: new Types.ObjectId(userId)
        });
        
          
          try {
            await cart.save();
            res.status(200).json({ message: 'Product added to cart', cart });
          } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Failed to add product to cart', error: err.message });
          }
          
        // cart = new Cart({ ...cartData, products: [productData] });
    } else {

        cartQty = cart.qty + qty;

        cart.qty=cartQty;
        await cart.save();
        res.status(200).json({message: 'Product added to cart', cart });
    }


    
};

export const getCartProducts = async (req, res, next) => {
    try {
        const { sessionId } = req.body;
        const userId = req.session.userAuthenticated ? req.session.user._id : null;
        // const cartData = userId ? { userId } : { dummy_user_id: sessionId };
        if (userId) {
            let cart = await Cart.find({user_id:userId}).populate('product_id')


            return res.status(200).json({data:cart}); 
        } else {
            return res.status(200).json({data:[]});
        }
    } catch (error) {
        console.error('Error fetching cart:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


export const qtyUpdate= async(req,res,next)=>{
    try {
        const {prodId,qty} =req.body;
        const userId = req.session.userAuthenticated ? req.session.user._id : null;

        if (!prodId || !qty || qty < 1) {
            return res.status(400).json({ message: 'Invalid product or quantity' });
        }
    
        // const cartData = userId ? { userId } : { dummy_user_id: req.body.sessionId };
    
        try {
            let cart = await Cart.findOne({user_id:userId,product_id:prodId});
    
            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }
    
            // const productIndex = cart.products.findIndex(p =>
            //     (p.car_id && p.car_id.toString() === prodId) ||
            //     (p.sps_id && p.sps_id.toString() === prodId)
            // );
    
            // if (productIndex === -1) {
            //     return res.status(404).json({ message: 'Product not found in cart' });
            // }
    
            // cart.products[productIndex].qty = qty;
            cart.qty=qty;
            await cart.save();
    
            res.status(200).json({ message: 'Product quantity updated', cart });
        } catch (error) {
            console.error('Error updating product quantity:', error);
            res.status(500).json({ message: 'Server error' });
        }
    } catch (error) {
        console.log('error',error);
    }

}

export const deleteCart = async (req, res, next) => {
    const { prodId, sessionId } = req.body;
    const userId = req.session.userAuthenticated ? req.session.user._id : null;

    const cartData = userId ? { userId } : { dummy_user_id: sessionId };

    try {
        if (prodId) {
            const cart = await Cart.findOneAndUpdate(
                cartData,
                {
                    $pull: {
                        products: {
                            $or: [
                                { car_id: prodId },
                                { sps_id: prodId }
                            ]
                        }
                    }
                },
                { new: true } 
            );

            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            return res.status(200).json({ message: 'Product removed from cart', cart });
        } 
        else {
            const cart = await Cart.findOneAndDelete(cartData);

            if (!cart) {
                return res.status(404).json({ message: 'Cart not found' });
            }

            return res.status(200).json({ message: 'All products removed from cart' });
        }
    } catch (error) {
        console.error('Error deleting product or cart:', error);
        return res.status(500).json({ message: 'Server error' });
    }
};


// export const createPaymentIntent = async (req, res) => {
//     const { amount, currency } = req.body;
  
//     try {
//         const paymentIntent = await stripe.paymentIntents.create({
//             amount,
//             currency,
//             automatic_payment_methods: { enabled: true }
//         });
  
//         res.status(200).json({ clientSecret: paymentIntent.client_secret });
//     } catch (error) {
//         console.error('Error creating payment intent:', error);
//         res.status(500).json({ error: 'Payment failed' });
//     }
//   };
export const createPaymentIntent = async (req, res) => {
    const userId = req.session.userAuthenticated ? req.session.user._id : null;

    if (!userId) {
        return res.status(403).json({ error: 'User not authenticated' });
    }

    try {
        const cart = await Cart.find({ user_id:userId }).populate('product_id');

        if (!cart) {
            return res.status(404).json({ error: 'Cart not found or empty' });
        }
        
        const lineItems = cart.map(item => ({
            price_data: {
                currency: 'INR',
                product_data: {
                    name: item.product_id?.name ,
                },
                unit_amount: (item.product_id?.price) * 100,  // Price in paise
            },
            quantity: item.qty,
        }));

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            customer_email: req.session.user.email,
            shipping_address_collection: {
                allowed_countries: ['IN'],
            },
            success_url: `${req.protocol}://${req.get('host')}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`
        });

        return res.status(200).json({ sessionId: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        return res.status(500).json({ error: 'Failed to create checkout session' });
    }
};

export const checkoutSuccess = async (req, res, next) => {
    const userId = req.session.userAuthenticated ? req.session.user._id : null;
    const sessionId = req.query.session_id;

    if (!userId) {
        return res.status(403).json({ error: 'User not authenticated' });
    }

    try {
        const session = await stripe.checkout.sessions.retrieve(sessionId);
        const paymentId = session.payment_intent;
        const currency = session.currency;
        const status = session.payment_status;

        const cart = await Cart.find({ user_id:userId }).populate('product_id');

        if (!cart ) {
            return res.status(404).json({ error: 'Cart not found or empty' });
        }

        let cartPrice = 0;
        cart.forEach(item => {
            const price = item.product_id?.price;
            cartPrice += price * item.qty;
        });
        // console.log(session,'req.session.cartUserDetails');
        

        const userData = {
            userId,
            name: session.customer_details.name,
            mobile: session.customer_details.phone,
            address: session.customer_details.address,
            address: {
                street: session.customer_details.street,
                city: session.customer_details.city,
                state: session.customer_details.state,
                country: session.customer_details.country
              },
            pincode: session.customer_details.address.postal_code,
        };

        const order = new Order({
            user: userData,
            products: cart,
        });

        await order.save();



        const paymentVerify = await Payment.findOne({ paymentId });
        if (!paymentVerify) {
            const payment = new Payment({
                paymentId,
                userId,
                products: cart.products,
                status,
                amount: cartPrice,
                currency,
            });
            await payment.save();
        }
        await Cart.findOneAndDelete({ user_id:userId });
        res.redirect('/cart?orderStatus=success');
    } catch (error) {
        console.error('Error in checkout success:', error);
        return res.status(500).json({ error: 'Failed to process checkout' });
    }
};

export const checkoutError = async(req,res,next)=>{
    res.redirect('/cart?orderStatus=fail');
}

export const saveUserAddress = (req, res) => {
    const userId = req.session.userAuthenticated ? req.session.user._id : null;

    if (!userId) {
        return res.status(403).json({ error: 'User not authenticated' });
    }

    const { cartFirstName, cartLastName, cartMobile, cartAddressInp, cartPincode } = req.body;

    if (!req.session.cartUserDetails) {
        req.session.cartUserDetails = {
            cartFirstName,
            cartLastName,
            cartMobile,
            cartAddressInp,
            cartPincode,
        };
    
    }

    
    res.status(200).json({ message: 'User address saved in session' });
};



// export const postOrder = async (req, res, next) => {

//     const {cartFirstName,cartLastName,cartMobile,cartAddressInp,cartPincode,sessionId}=req.body;
//     const userId = req.session.userAuthenticated ? req.session.user._id : null;

//     if (!userId) {
//         return res.status(403).json({ error: 'User not authenticated' });
//     }

//     try {
//         const session = await stripe.checkout.sessions.retrieve(sessionId);
//         const status = session.payment_status;

//         const cart = await Cart.findOne({ userId }).populate('products.car_id').populate('products.sps_id');
        
//         if (!cart || cart.products.length === 0) {
//             return res.status(404).json({ error: 'Cart not found or empty' });
//         }

//         let cartPrice = 0;
//         cart.products.forEach(item => {
//             const price = item.car_id?.price || item.sps_id?.price || 0;
//             cartPrice += price * item.qty;
//         });
// const userData={
//     userId,
//     firstname:cartFirstName,
//     lastname:cartLastName,
//     mobile:cartMobile,
//     address:cartAddressInp,
//     pincode:cartPincode
// }
//         const order = new Order({
//             user:userData,
//             products: cart.products,
//         });

//         await order.save();

//         res.status(200).json({message:"Order Placed successfully"});
//     } catch (error) {
//         console.error('Error in checkout success:', error);
//         return res.status(500).json({ error: 'Failed to process checkout' });
//     }
// };