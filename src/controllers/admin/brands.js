import { validationResult } from "express-validator";
// import { deleteFile } from "../config/fileunlink.js";
import multer from "multer";
// import { upload } from "../config/imagefile.js";
// import Payment from "../models/payment.js";
import categories from "../../models/categories.js";
import brands from "../../models/brands.js";

export const getBrandLists = async (req, res, next) => {
  try {
    const brand = await brands.find({deletedAt:null}).populate("category_id", "title");
    console.log('brand',brand);
    
    const updatedBrands = brand.map((c) => {
      const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return { ...c.toObject(), createdTime: formattedDate };
    });
    res.render("admin/brands/index", {
      brands: updatedBrands,
      pageTitle: "Admin | Brands",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getCreateBrand = async (req, res, next) => {
  try {
    const category = await categories.find();
    res.render("admin/brands/add", {
      pageTitle: "Admin | Brands | Create",
      categories: category,
      errorMessage: null,
      oldInput: { category: "", name: "" },
      validationErrors: [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createBrand = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const categories1 = await categories.find();
    if (!errors.isEmpty()) {
      return res.render("admin/brands/add", {
        pageTitle: "Admin | Brands | Create",
        categories: categories1,
        errorMessage: "Validation failed. Please check the errors below.",
        oldInput: {
          category: req.body.category,
          name: req.body.name,
        },
        validationErrors: errors.array(),
      });
    }
    const { category, name, } = req.body;
   
      const b = new brands({
        name: name,
        category_id:category
      });
      await b.save();
      req.flash('success', 'Brand Created Successfully');
      res.redirect("/admin/brands");
   
  } catch (error) {
    req.flash('error', 'Failed to create brand',error);
    res.redirect("/admin/brands");
  }
};

export const getEditBrand = async (req, res, next) => {
  try {
    const brandId = req.params.brandId;
    const category = await categories.find();
    const brand = await brands.findById(brandId).populate('category_id');
    if (brand) {
      res.render("admin/brands/edit", {
        brands: brand,
        categories:category,
        pageTitle: "Admin | Brands | Edit",
        errorMessage: null,
        validationErrors: [],
      });
    } else {
      res.redirect("/admin/brands");
    }
  } catch (error) {
    res.redirect("/admin/brands");
  }
};

export const updateBrand = async (req, res, next) => {
    try {
      const { category, brandId, name } = req.body;
      const errors = validationResult(req);
  
      const categoriesList = await categories.find();
      const brand = await brands.findById(brandId);
  
      if (!brand) {
        req.flash('error', 'Brand not found');
        return res.redirect('/admin/brands');
      }
  
      if (!errors.isEmpty()) {
        return res.render("admin/brands/edit", {
          pageTitle: "Admin | Brands | Edit",
          categories: categoriesList,
          brands: {
            _id: brandId,
            name,
            category_id: category,
          },
          errorMessage: "Validation failed. Please check the errors below.",
          validationErrors: errors.array(),
        });
      }
  
     
      brand.name = name;
      brand.category_id = category;
  
      await brand.save();
      req.flash('success', 'Brand updated successfully');
      return res.redirect("/admin/brands");
  
    } catch (error) {
      console.error(error);
      req.flash('error', 'Something went wrong');
      return res.redirect("/admin/brands");
    }
  };

export const getTrashedBrandLists = async (req, res, next) => {
    try {
        const brand = await brands.find({deletedAt:{$ne:null}}).populate("category_id", "title");
    
        const updatedBrands = brand.map((c) => {
          const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          });
          return { ...c.toObject(), createdTime: formattedDate };
        });
        res.render("admin/brands/trash", {
          brands: updatedBrands,
          pageTitle: "Admin | Brands",
        });
      } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
      }
};


export const softDeleteBrand = async (req,res,next)=>{
  try {
    const brandId = req.body.brandId;
    const findBrand = await brands.findByIdAndUpdate(
      brandId,
      { deletedAt: new Date() },
      { new: true }
    );
    if (findBrand) {
      req.flash("success", "Brand Deleted Successfully");
      return res.redirect("/admin/brands");
    } else {
      req.flash("error", "Brand not found");
      return res.redirect("/admin/brands");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Brand Deletion Failed");
    return res.redirect("/admin/brands");
  }
}

export const restoreBrand = async (req,res,next)=>{
  try {
    const brandId = req.params.brandId;
    const findBrands = await brands.findByIdAndUpdate(
      brandId,
      { deletedAt: null },
      { new: true }
    );
    if (findBrands) {
      req.flash("success", "Brands Restored Successfully");
      return res.redirect("/admin/brands/trash");
    } else {
      req.flash("error", "Brands not found");
      return res.redirect("/admin/brands/trash");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Brand Restore Failed");
    return res.redirect("/admin/brands/trash");
  }
}

export const deleteBrand = async (req, res, next) => {
  try {
    const brandId = req.body.brandId;
    const brand = await brands.findById(brandId);
    if (!brand) {
      req.flash('error', 'Brand not found');
      return res.redirect("/admin/brands");
    }
    await brand.deleteOne();

    req.flash('success', 'Brand deleted successfully');
    res.redirect("/admin/brands/trash");
  } catch (error) {
    console.log(error);
    req.flash('error', 'Failed to delete the brand');
    res.redirect("/admin/brands/trash");
  }
};
