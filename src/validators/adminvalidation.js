import { body } from "express-validator";
import Brand from "../models/brands.js";
import User from "../models/users.js";
import bcrypt from "bcryptjs";
import categories from "../models/categories.js";
import brands from "../models/brands.js";
import products from "../models/products.js";


export const createBrandVal = [
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category field is required"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name field is required")
    .bail()
    .custom(async (value, { req }) => {
      const existingBrand = await brands.findOne({
        category_id: req.body.category,
        name: value,
      });

      if (existingBrand) {
        throw new Error("A brand with this name already exists in the selected category.");
      }

      return true;
    }),
];

export const updateBrandVal = [
  body("category")
    .trim()
    .notEmpty()
    .withMessage("Category field is required"),

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name field is required")
    .bail()
    .custom(async (value, { req }) => {
      const existingBrand = await brands.findOne({
        name: value,
        category_id: req.body.category,
        _id: { $ne: req.body.brandId }, 
      });

      if (existingBrand) {
        throw new Error("Another brand with this name already exists in the selected category.");
      }

      return true;
    }),
];

export const createSPVal=[
    body('category').trim().not().isEmpty().withMessage('Category field is required'),
    body('name').trim().not().isEmpty().withMessage('Name field is required'),
    body('price').trim().not().isEmpty().withMessage('price field is required'),
    body('desc').trim().not().isEmpty().withMessage('Description field is required'),
]

export const createSPCVal=[
    body('name').trim().not().isEmpty().withMessage('Name field is required'),
]

export const createUserVal = [
    body('username')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Username field is required'),
      
    body('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Email field is required')
      .isEmail()
      .withMessage('Email is invalid')
      .custom(async (value) => {
        const user = await User.findOne({ email: value });
        if (user) {
          throw new Error('Email already exists');
        }
        return true;
      }),
      
    body('password')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Password field is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.')
      .matches(/(?=.*[A-Z])/)
      .withMessage('Password must contain at least one uppercase letter.')
      .matches(/(?=.*[0-9])/)
    .withMessage('Password must contain at least one number.')
      .matches(/(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one special character.'),
      
      
    body('cpassword')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Confirm Password field is required')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('The confirm password did not match the entered password!');
        }
        return true;
      }),
  ];
  export const editUserVal = [
    body('username')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Username field is required'),
    
    body('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Email field is required')
      .isEmail()
      .withMessage('Email is invalid')
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value, _id: { $ne: req.body.userId } });
        if (user) {
          throw new Error('Email already exists');
        }
        return true;
      }),
    
    body('currentpassword')
      .if((value, { req }) => req.body.passwordUpdate === '1')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Current Password field is required')
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
          const isMatch = await bcrypt.compare(value, user.password);
          if (!isMatch) {
            throw new Error('The password did not match the existing one.');
          }
        }
        return true;
      }),
    
    body('password')
      .if((value, { req }) => req.body.passwordUpdate === '1')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Password field is required')
      .isLength({ min: 8 })
      .withMessage('Password must be at least 8 characters long.')
      .matches(/(?=.*[A-Z])/)
      .withMessage('Password must contain at least one uppercase letter.')
      .matches(/(?=.*[0-9])/)
      .withMessage('Password must contain at least one number.')
      .matches(/(?=.*[!@#$%^&*])/)
      .withMessage('Password must contain at least one special character.'),
    
    body('cpassword')
      .if((value, { req }) => req.body.passwordUpdate === '1')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Confirm Password field is required')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('The confirm password did not match the entered password!');
        }
        return true;
      }),
  ];


  export const createLoginVal = [
    body('email')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Email field is required')
      .custom(async (value) => {
        const findEmail = await User.findOne({ email: value });
        if (!findEmail) {
          throw new Error('Email does not exist');
        }
        return true;
      }),
    
    body('password')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Password field is required')
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: req.body.email });
        if (user) {
          const passwordCheck = await bcrypt.compare(value, user.password);
          if (!passwordCheck) {
            throw new Error('Password is incorrect');
          }
        }
        return true;
      }),
  ];

  export const clientLogin=[
    body('email').trim().notEmpty().withMessage('Email field is required').isEmail()
    .withMessage('Please provide a valid email'),
    body('password').trim().notEmpty().withMessage('Password field is required')
  ];



export const createCategoryVal = [
    body('title')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Title field is required')
      .custom(async (value) => {
        const category = await categories.findOne({ title: value });
        if (category) {
          throw new Error('The category already exists,please give new one');
        }
        return true;
      })
  ];

  export const updateCategoryVal = [
    body('categoryId')
      .trim()
      .not()
      .isEmpty()
      .withMessage('categoryId is required')
      .custom(async (value, { req }) => {
        const category = await categories.findOne({ _id: value });
  
        if (!category) {
          throw new Error('The category does not exists');
        }
        return true;
      }),
    body('title')
      .trim()
      .not()
      .isEmpty()
      .withMessage('Title is required')
      .custom(async (value, { req }) => {
        const category = await categories.findOne({ name: value, _id: { $ne: req.body.categoryId } });
  
        if (category) {
          throw new Error('The category already exists');
        }
        return true;
      })
  ];


  export const createProductVal = [
    body("bname")
      .trim()
      .notEmpty()
      .withMessage("Brand field is required"),
  
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name field is required")
      .bail()
      .custom(async (value, { req }) => {
        const existingProduct = await products.findOne({
          brand: req.body.bname,
          name: value,
        });
  
        if (existingProduct) {
          throw new Error("A product with this name already exists in the selected brand.");
        }
  
        return true;
      }),
      body('price')
      .notEmpty()
      .withMessage("Price field is required"),
      body('desc')
      .notEmpty()
      .withMessage("Description field is required"),
      body('qty')
      .notEmpty()
      .withMessage("Qty field is required")
  ];

  export const updateProductVal = [
    body('productId')
      .trim()
      .not()
      .isEmpty()
      .withMessage('productId is required')
      .custom(async (value, { req }) => {
        const product = await products.findOne({ _id: value });
  
        if (!product) {
          throw new Error('The Product does not exists');
        }
        return true;
      }),
    body("bname")
      .trim()
      .notEmpty()
      .withMessage("Brand field is required"),
  
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name field is required")
      .bail()
      .custom(async (value, { req }) => {
        const existingProduct = await products.findOne({
          brand: req.body.bname,
          name: value,
          _id: { $ne: req.body.productId }
        });
  
        if (existingProduct) {
          throw new Error("A product with this name already exists in the selected brand.");
        }
  
        return true;
      }),
      body('price')
      .notEmpty()
      .withMessage("Price field is required"),
      body('desc')
      .notEmpty()
      .withMessage("Description field is required"),
      body('qty')
      .notEmpty()
      .withMessage("Qty field is required")
  ];
  