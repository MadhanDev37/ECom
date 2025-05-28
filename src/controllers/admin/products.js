import { validationResult } from "express-validator";
import { deleteFile } from "../../config/fileunlink.js";

import products from "../../models/products.js";
import { upload } from "../../config/imagefile.js";
import brands from "../../models/brands.js";

const spImages = upload.array("images", 10);

export const getProductLists = async (req, res, next) => {
  try {
    const product = await products
  .find({ deletedAt: null })
  .populate({
    path: 'brand',
    populate: {
      path: 'category_id',
      model: 'Categories'
    }
  });

    const updatedProducts = product.map((c) => {
      const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return { ...c.toObject(), createdTime: formattedDate };
    });
    res.render("admin/products/index", {
      products: updatedProducts,
      pageTitle: "Admin | Products",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getCreateProduct = async (req, res, next) => {
  try {
    const brand = await brands.find().populate("category_id", "title");
    res.render("admin/products/add", {
      pageTitle: "Admin | Products | Create",
      brands: brand,
      errorMessage: null,
      oldInput: { bname: "", name: "", price: "", desc: "",qty: "" },
      validationErrors: [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createProduct = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const brand = await brands.find();
    const allErrors = [...errors.array()];
    if (!req.files || req.files.length === 0) {
      const imageError = {
        type: "field",
        value: "",
        msg: "Image field is required",
        path: "images",
        location: "body",
      };
      allErrors.push(imageError);
    }
    
    if (!errors.isEmpty() || allErrors.length > 0) {
      return res.render("admin/products/add", {
        pageTitle: "Admin | Products | Create",
        brands: brand,
        errorMessage: "Validation failed. Please check the errors below.",
        oldInput: {
          bname: req.body.bname,
          name: req.body.name,
          price: req.body.price,
          desc: req.body.desc,
          qty: req.body.qty,
        },
        validationErrors: allErrors,
      });
    }

    const relativePaths = req.files.map((file) => `images/${file.filename}`);

    const { bname, name, price, desc, qty } = req.body;

      const p = new products({
        name: name,
        price: price,
        description: desc,
        qty: qty,
        images: relativePaths,
        brand: bname,
      });
      await p.save();
      req.flash('success', 'Product Created Successfully');
      res.redirect("/admin/products");
  
  } catch (error) {
    console.log('error',error)
    req.flash('error', 'Failed to create product');
    res.redirect("/admin/products");
  }
};

export const getEditProduct = async (req, res, next) => {
  try {
    const productId = req.params.productId;
    const product = await products.findById(productId);
    const brand = await brands.find().populate("category_id", "title");
    if (product) {
      res.render("admin/products/edit", {
        products: product,
        brands: brand,
        pageTitle: "Admin | Products | Edit",
        errorMessage: null,
        validationErrors: [],
      });
    } else {
      res.redirect("/admin/products");
    }
  } catch (error) {
    console.log('error',error);
    
    res.redirect("/admin/products");
  }
};

export const updateProduct = async (req, res, next) => {
  try {
    const { bname, name, price, desc, qty, productId } = req.body;
    const errors = validationResult(req);
    const brandList = await brands.find();
    const findProduct = await products.findById(productId);

    

    if (!findProduct) {
      req.flash('error', 'Product not found');
      return res.redirect("/admin/products");
    }

    if (!errors.isEmpty()) {
      return res.render("admin/products/edit", {
        pageTitle: "Admin | Products | Edit",
        brands: brandList,
        errorMessage: "Validation failed. Please check the errors below.",
        products: {
          brand: bname,
          name,
          price,
          description: desc,
          qty,
          images: findProduct.images,
          _id: productId,
        },
        validationErrors: errors.array(),
      });
    }

    if (req.files && req.files.length > 0) {
      if (Array.isArray(findProduct.images)) {
        for (const image of findProduct.images) {
          await deleteFile(image);
        }
      } else if (findProduct.images) {
        await deleteFile(findProduct.images);
      }
    }
    
    const images = req.files && req.files.length > 0
      ? req.files.map((file) => `images/${file.filename}`)
      : findProduct.images;

    findProduct.brand = bname;
    findProduct.name = name;
    findProduct.price = price;
    findProduct.description = desc;
    findProduct.qty = qty;
    findProduct.images = images;

    await findProduct.save();
    req.flash('success', 'Product updated Successfully');
    res.redirect("/admin/products");

  } catch (error) {
    // console.error(error);

    const brandList = await brands.find();
   
    const fallbackProduct = await products.findById(req.body.productId);

    

    res.status(500).render("admin/products/edit", {
      pageTitle: "Admin | Products | Edit",
      brands: brandList,
      errorMessage: "An unexpected error occurred. Please try again later.",
      products: {
        brand: req.body.bname,
        name: req.body.name,
        price: req.body.price,
        description: req.body.desc,
        qty: req.body.qty,
        images: fallbackProduct ? fallbackProduct.images : [],
        _id: req.body.productId,
      },
      validationErrors: [],
    });
  }
};


export const getTrashedProductLists = async (req, res, next) => {
  try {
    const product = await products.find({deletedAt:{$ne:null}}).populate("brand");
    const updatedProducts = product.map((c) => {
      const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return { ...c.toObject(), createdTime: formattedDate };
    });
    res.render("admin/products/trash", {
      products: updatedProducts,
      pageTitle: "Admin | Products",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const softDeleteProduct = async (req,res,next)=>{
  try {
    const productId = req.body.productId;
    const findProduct = await products.findByIdAndUpdate(
      productId,
      { deletedAt: new Date() },
      { new: true }
    );
    if (findProduct) {
      req.flash("success", "Product Deleted Successfully");
      return res.redirect("/admin/products");
    } else {
      req.flash("error", "Product not found");
      return res.redirect("/admin/products");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Product Deletion Failed");
    return res.redirect("/admin/products");
  }
}

export const restoreProduct = async (req,res,next)=>{
  try {
    const productId = req.params.productId;
    const findProduct = await products.findByIdAndUpdate(
      productId,
      { deletedAt: null },
      { new: true }
    );
    if (findProduct) {
      req.flash("success", "Product Restored Successfully");
      return res.redirect("/admin/products/trash");
    } else {
      req.flash("error", "Product not found");
      return res.redirect("/admin/products/trash");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Product Restore Failed");
    return res.redirect("/admin/products/trash");
  }
}

export const deleteProduct = async (req, res, next) => {
  try {
    const productId = req.body.productId;
    const product = await products.findById(productId);
    if (!product) {
      req.flash('error', 'Producct not found');
      return res.redirect("/admin/products");
    }

    await product.deleteOne();

    req.flash('success', 'Product deleted successfully');
    res.redirect("/admin/products/trash");
  } catch (error) {
    console.log(error);
    req.flash('error', 'Failed to delete the product.');
    res.redirect("/admin/products/trash");
  }
};

