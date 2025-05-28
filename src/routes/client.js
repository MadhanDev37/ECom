import  express from "express";
const router= express.Router();
import {  getIndex, getProducts, getAllProductsPage, getCategories, getAllProducts, getProductsDetailPage, getProductDetails,getCart} from '../controllers/clientcontroller.js';
// import { getAllCars, getAllProductsPage, getAllSps, getCarDetails, getCarLists, getCart, getCategories, getHomeCars, getHomeSpareParts, getHomeSparePartsCategories, getIndex, getProducts, getSPSDetails, getSPSList } from '../controllers/clientcontroller.js';
import { authStatus, getProfile, login, logout, profile, signup, updateUserDetails } from '../controllers/authcontroller.js';
import { clientLogin,createUserVal } from "../validators/adminvalidation.js";
import { cartAdd, checkoutError, checkoutSuccess, createPaymentIntent, deleteCart, getCartProducts, qtyUpdate, saveUserAddress } from "../controllers/cartcontroller.js";
// import { cartAdd, checkoutError, checkoutSuccess, createPaymentIntent, deleteCart, getCartProducts, qtyUpdate, saveUserAddress } from "../controllers/cartcontroller.js";
import { isClientAuth } from "../middlewares/authMiddleware.js";

import { upload } from "../config/imagefile.js";

// router.get('/carlist',getCarLists);
// router.get('/spslist',getSPSList);
// router.get('/carlist/:carid',getCarDetails);
// router.get('/spslist/:spsid',getSPSDetails);
// router.post('/getHomeCars',getHomeCars);
// router.post('/getAllCars',getAllCars);
// router.post('/getAllSps',getAllSps);
// router.get('/getHomeSparePartsCategories',getHomeSparePartsCategories);
// router.post('/getHomeSpareParts',getHomeSpareParts);

// products
router.get('/',getIndex);
router.get('/products',getAllProductsPage);
router.get('/details',getProductsDetailPage);

router.get('/api/products',getProducts);
router.get('/api/categories',getCategories);
router.post('/api/products',getAllProducts);
router.post('/api/details',getProductDetails);

router.post('/auth/signup',createUserVal,signup)
router.post('/auth/login',upload.none(),clientLogin,login);
router.get('/auth/profile',isClientAuth,getProfile);
router.get('/auth/profile/details',profile);
router.post('/auth/logout',logout);
router.post('/auth/status',upload.none(),authStatus);
router.get('/auth/status',upload.none(),authStatus);

router.get('/cart',getCart);
router.post('/cart/all',getCartProducts);
router.post('/cart/update/qty',qtyUpdate);
router.post('/api/cart/add',cartAdd);
router.post('/cart/delete',deleteCart);
router.post('/cart/checkout',createPaymentIntent)
// router.post('/cart/order',postOrder)
// router.post('/cart/saveuseraddress',saveUserAddress)
router.get('/checkout/success',checkoutSuccess);
router.get('/checkout/cancel',checkoutError);
router.post('/updateUserDetails',updateUserDetails)
export default router;