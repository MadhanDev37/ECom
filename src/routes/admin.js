import express from "express";
import { getBrandLists,getCreateBrand, deleteBrand, createBrand, getEditBrand, updateBrand, getTrashedBrandLists, softDeleteBrand ,restoreBrand} from "../controllers/admin/brands.js";
import { createBrandVal, createCategoryVal,createLoginVal,createProductVal,createUserVal, editUserVal, updateBrandVal, updateCategoryVal, updateProductVal } from "../validators/adminvalidation.js";
import { upload } from "../config/imagefile.js";
import multer from "multer";
import Brand from "../models/brands.js";
import Car from "../models/products.js";
import { createUser, deleteUser, getAddUser, getEditUser, getLogin, getTrashedUsers, getUsers, login, logout, restoreUser, softDeleteUser, updateUser } from "../controllers/adminauthcontroller.js";
import { isAdminAuth, isAdminAuthenticated, isClientAuthenticated } from "../middlewares/authMiddleware.js";
import { createCategory, deleteCategory, getCategories, getCreateCategory, getEditCategory, getTrashedCategories, restoreCategory, softDeleteCategory, updateCategory } from "../controllers/admin/categories.js";
import { createProduct, deleteProduct, getCreateProduct, getEditProduct, getProductLists, getTrashedProductLists, restoreProduct, softDeleteProduct, updateProduct } from "../controllers/admin/products.js";
import brands from "../models/brands.js";
import { getOrders } from "../controllers/admin/orders.js";

const Images=upload.array('images');

const router = express.Router();

router.get('/brands', isAdminAuth,getBrandLists);
router.get('/brands/add',isAdminAuth, getCreateBrand);
router.post('/brands/add',isAdminAuth, upload.none(), createBrandVal, createBrand);

router.get('/brands/edit/:brandId',isAdminAuth, getEditBrand);
router.post('/brands/edit',isAdminAuth,upload.none(),updateBrandVal,updateBrand);
router.post('/brands/delete',isAdminAuth,deleteBrand);

router.get('/brands/trash',isAdminAuth, getTrashedBrandLists);


router.post('/brands/softdelete',isAdminAuth,softDeleteBrand)
router.get('/brands/restore/:brandId',isAdminAuth,restoreBrand)


router.get('/orders', isAdminAuth,getOrders);
router.get('/brands/add',isAdminAuth, getCreateBrand);
router.post('/brands/add',isAdminAuth, upload.none(), createBrandVal, createBrand);

// router.get('/sparepartscategories',isAdminAuth,getCarSparePartsCategoriesLists)

// router.get('/sparepartscategories/add',isAdminAuth, getCreateCarSparePartsCategories);
// router.post('/sparepartscategories/add',isAdminAuth,  createSPCVal, createCarSparePartsCategories);
// router.get('/sparepartscategories/edit/:spcId',isAdminAuth, getEditSparePartsCategories);
// router.post('/sparepartscategories/edit',isAdminAuth,  createSPCVal, updateSparePartsCategory);
// router.get('/sparepartscategories/trash',isAdminAuth,getTrashedCarSparePartsCategoriesLists)
// router.post('/sparepartscategories/softdelete',isAdminAuth,softDeleteSparePartsCategory)
// router.get('/sparepartscategories/restore/:spcId',isAdminAuth,restoreSparePartsCategory)
// router.post('/sparepartscategories/delete',isAdminAuth,deleteSparePartsCategory);

router.get('/users',isAdminAuth,getUsers)
router.get('/users/add',isAdminAuth,getAddUser)
router.post('/users/add',isAdminAuth,  createUserVal, createUser);
router.get('/users/edit/:userId',isAdminAuth,getEditUser)
router.post('/users/edit',isAdminAuth,  editUserVal, updateUser);
router.get('/users/trash',isAdminAuth,getTrashedUsers)
router.post('/users/softdelete',isAdminAuth,softDeleteUser)
router.get('/users/restore/:userId',isAdminAuth,restoreUser)
router.post('/users/delete',isAdminAuth,deleteUser);
router.get('/login',isClientAuthenticated,isAdminAuthenticated,getLogin);
router.post('/login',isClientAuthenticated,createLoginVal,login);
router.post('/logout',isClientAuthenticated,logout);


// categories
router.get('/categories',isAdminAuth,getCategories)
router.get('/categories/add',isAdminAuth,getCreateCategory)
router.post('/categories/add',isAdminAuth, upload.none(),createCategoryVal,createCategory);
router.get('/categories/edit/:categoryId',isAdminAuth,getEditCategory)
router.post('/categories/edit',isAdminAuth, upload.none(), updateCategoryVal, updateCategory);
router.get('/categories/trash',isAdminAuth,getTrashedCategories)
router.post('/categories/softdelete',isAdminAuth,softDeleteCategory)
router.get('/categories/restore/:categoryId',isAdminAuth,restoreCategory)
router.post('/categories/delete',isAdminAuth,deleteCategory);

// products

router.get('/products', getProductLists);
router.get('/products/add', getCreateProduct);
router.post(
    '/products/add',
    upload.array('images'),   
    createProductVal,         
    createProduct             
  );
  router.get('/products/edit/:productId', getEditProduct);
  router.post('/products/edit', Images, updateProductVal, updateProduct);
router.post('/products/softdelete',softDeleteProduct)
router.get('/products/restore/:productId',restoreProduct)
router.post('/products/delete',deleteProduct)
router.get('/products/trash', getTrashedProductLists);





router.use(async (err, req, res, next) => {
    if (
      err instanceof Error &&
      (err.name === 'MulterError' ||
       err.message.includes('Invalid file type') ||
       err.message === 'Image validation failed')
    ) {
      try {
        const brand = await brands.find();
        const validationErrors = err.validationErrors || [
            {
              type: 'field',
              value: '',
              msg: err.message || 'Invalid image file',
              path: 'images',
              location: 'body'
            }
          ];
        return res.status(422).render("admin/products/edit", {
          pageTitle: "Admin | Products | Edit",
          brands: brand,
          errorMessage: err.message || "An unexpected error occurred. Please try again later.",
          products: {
            brand: req.body.bname,
            name: req.body.name,
            price: req.body.price,
            description: req.body.desc,
            qty: req.body.qty,
            images: req.body.oldImages ? [req.body.oldImages] : [],
            _id: req.body.productId,
          },
          validationErrors: validationErrors,
        });
      } catch (fetchError) {
        console.error("Error while fetching brands:", fetchError);
        return res.status(500).send("Internal server error");
      }
    }
  
    next(err);
  });
    











// // // spare parts 

// // router.get('/spareparts', getCarSparePartsLists);
// // router.get('/spareparts/add', getCreateSpareParts);
// // // router.post('/spareparts/add',upload.array('images',10),createSPVal,createSpareParts);
// // router.post('/spareparts/add', (req, res, next) => {
// //   spImages(req, res, async (err) => {
// //     if (err instanceof multer.MulterError) {
// //       let validationError='';
// //       if (err.code === 'LIMIT_UNEXPECTED_FILE') {
// //         validationError = 'You can upload a maximum of 10 images';
// //       } else {
// //         validationError = err.message;
// //       }

// //       req.validationErrors = [{
// //         value: '',
// //         msg: validationError,
// //         path: 'images',
// //         location: 'body'
// //     }];
// //     console.log('Multer error:', req.validationErrors);
// //       const cars = await Car.find();

// //       return res.render('admin/spareparts/add', {
// //         pageTitle: "Admin | Cars | Spare Parts | Create",
// //         cars: cars,
// //         oldInput: {
// //           car: req.body.car,
// //           category: req.body.category,
// //           name: req.body.name,
// //           prize: req.body.prize,
// //           desc: req.body.desc,
// //           status: req.body.status,
// //         },
// //         validationErrors: req.validationErrors,
// //       });
// //     } else if (err) {
     
// //       const cars = await Car.find();
// //       req.validationErrors = [{
// //         value: '',
// //         msg: err.message,
// //         path: 'images',
// //         location: 'body'
// //     }];
// //     console.log('Generic error:', req.validationErrors);
// //       return res.render('admin/spareparts/add', {
// //         pageTitle: "Admin | Cars | Spare Parts | Create",
// //         cars: cars,
// //         oldInput: {
// //           car: req.body.car,
// //           category: req.body.category,
// //           name: req.body.name,
// //           prize: req.body.prize,
// //           desc: req.body.desc,
// //           status: req.body.status,
// //         },
// //         validationErrors: req.validationErrors,
// //       });
// //     } else {
// //       next(); // Proceed to the next middleware (createSPVal) if no errors
// //     }
// //   });
// // }, createSPVal, createSpareParts);

// // router.get('/spareparts/edit/:spId', getEditSpareParts);
// // router.post('/spareparts/edit', (req, res, next) => {
// //   spImages(req, res, async (err) => {
// //     const cars = await Car.find();
// //     const findSP = await SP.findById(req.body.spId);

// //     if (err instanceof multer.MulterError) {
// //       let validationError = '';
// //       if (err.code === 'LIMIT_UNEXPECTED_FILE') {
// //         validationError = 'You can upload a maximum of 10 images';
// //       } else {
// //         validationError = err.message;
// //       }

// //       req.validationErrors = [{
// //         value: '',
// //         msg: validationError,
// //         param: 'images',
// //         location: 'body'
// //       }];
// //       console.log('Multer error:', req.validationErrors);

// //       return res.render('admin/spareparts/edit', {
// //         pageTitle: "Admin | Cars | Spare Parts | Edit",
// //         cars: cars,
// //         sp: {
// //           carId: req.body.car,
// //           category: req.body.category,
// //           name: req.body.name,
// //           prize: req.body.prize,
// //           description: req.body.desc,
// //           images: findSP.images,
// //           _id: findSP._id,
// //           status: req.body.status,
// //         },
// //         validationErrors: req.validationErrors,
// //       });
// //     } else if (err) {
// //       req.validationErrors = [{
// //         value: '',
// //         msg: err.message,
// //         param: 'images',
// //         location: 'body'
// //       }];
// //       console.log('Generic error:', req.body);

// //       return res.render('admin/spareparts/edit', {
// //         pageTitle: "Admin | Cars | Spare Parts | Edit",
// //         cars: cars,
// //         sp: {
// //           carId: req.body.car,
// //           category: req.body.category,
// //           name: req.body.name,
// //           prize: req.body.prize,
// //           description: req.body.desc,
// //           images: findSP.images,
// //           _id: findSP._id,
// //           status: req.body.status,
// //         },
// //         validationErrors: req.validationErrors,
// //       });
// //     } else {
// //       next(); // Proceed to the next middleware (createSPVal) if no errors
// //     }
// //   });
// // }, createSPVal, updateSpareParts);
// // router.post('/spareparts/softdelete',softDeleteSpareParts)
// // router.get('/spareparts/restore/:spId',restoreSpareParts)
// // router.post('/spareparts/delete',deleteSpareParts)
// // router.get('/spareparts/trash', getTrashedCarSparePartsLists);

// router.get('/orders',getOrders)
export default router;
