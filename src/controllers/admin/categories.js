import { validationResult } from "express-validator";
import categories from "../../models/categories.js";

export const getCategories = async (req, res, next) => {
  try {
    const categoryList = await categories.find({ deletedAt: null });
    const categoriesWithTime = categoryList.map((ct) => {
      const formattedDate = new Date(ct.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );

      return {
        ...ct.toObject(),
        createdTime: formattedDate,
      };
    });

    res.render("admin/categories/index", {
      pageTitle: "Admin | Categories",
      categories: categoriesWithTime,
    });
  } catch (error) {
    console.error("Error in getCategories:", error);
    if (!res.headersSent) {
      res.status(500).json({ message: "Server Error" });
    }
  }
};

export const getCreateCategory = async (req, res, next) => {
  try {
    res.render("admin/categories/add", {
      pageTitle: "Admin | Categories | Create",
      errorMessage: null,
      oldInput: { title: "" },
      validationErrors: [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const { title } = req.body;

    if (!errors.isEmpty()) {
      return res.render("admin/categories/add", {
        pageTitle: "Admin | Categories | Create",
        errorMessage: "Validation failed. Please check the errors below.",
        oldInput: { title },
        validationErrors: errors.array(),
      });
    }

    const cat = new categories({
      title,
    });

    await cat.save();
    req.flash('success', 'Category Created Successfully');
    res.redirect("/admin/categories");
    
  } catch (error) {
    console.error("Error creating category:", error);
    req.flash('error', 'Category Create Failed!');
    if (!res.headersSent) {
      res.redirect("/admin/categories/add");
    }
  }
};


export const getEditCategory = async (req, res, next) => {
  try {
    const categoryId = req.params.categoryId;
    const category = await categories.findById(categoryId);
    if (category) {
      res.render("admin/categories/edit", {
        category: category,
        pageTitle: "Admin | Categories | Edit",
        errorMessage: null,
        validationErrors: [],
      });
    } else {
      res.redirect("/admin/categories");
    }
  } catch (error) {
    res.redirect("/admin/categories");
    // console.log(error);
    // res.status(500).json({ message: "Server Error" });
  }
};
export const updateCategory = async (req, res, next) => {
  try {
    const { title, categoryId } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("admin/categories/edit", {
        pageTitle: "Admin | Categories | Edit",
        errorMessage: errors.array()[0].msg,
        category: { title, _id: categoryId },
        validationErrors: errors.array(),
      });
    }

    const existingCategory = await categories.findById(categoryId);

    if (!existingCategory) {
      return res.status(404).render("admin/categories/edit", {
        pageTitle: "Admin | Categories | Edit",
        errorMessage: "Category not found",
        category: { title, _id: categoryId },
        validationErrors: [],
      });
    }

   

    existingCategory.title = title;
    await existingCategory.save();

    req.flash('success', 'Category updated successfully');
    res.redirect("/admin/categories");
  } catch (error) {
    console.error("Category update failed:", error);
    req.flash('error', 'Category update failed!');
    if (!res.headersSent) {
      res.redirect("/admin/categories");
    }
  }
};




export const softDeleteCategory = async(req,res,next)=>{
  try {
    const categoryId = req.body.categoryId;
    const findCategory = await categories.findByIdAndUpdate(
      categoryId,
      { deletedAt: new Date() },
      { new: true }
    );
    if (findCategory) {
      req.flash("success", "Category Deleted Successfully");
      return res.redirect("/admin/categories");
    } else {
      req.flash("error", "Category not found");
      return res.redirect("/admin/categories");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Category Deletion Failed");
    return res.redirect("/admin/categories");
  }
}
export const restoreCategory = async(req,res,next)=>{
  try {
    const categoryId = req.params.categoryId;
    const findCategory = await categories.findByIdAndUpdate(
      categoryId,
      { deletedAt: null },
      { new: true }
    );
    if (findCategory) {
      req.flash("success", "Category Restored Successfully");
      return res.redirect("/admin/categories/trash");
    } else {
      req.flash("error", "Category not found");
      return res.redirect("/admin/categories/trash");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Category Restore Failed");
    return res.redirect("/admin/categories/trash");
  }
}

export const getTrashedCategories = async (req, res, next) => {
  try {
    const trashedCategories = await categories.find({ deletedAt: { $ne: null } });

    const categoriesWithTime = trashedCategories.map((cat) => {
      const formattedDate = new Date(cat.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      return {
        ...cat.toObject(),
        createdTime: formattedDate,
      };
    });

    res.render("admin/categories/trash", {
      pageTitle: "Admin | Categories | Trash",
      categories: categoriesWithTime,
    });
  } catch (error) {
    console.error("Error fetching trashed categories:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const deleteCategory = async (req, res, next) => {
  try {
    const { categoryId } = req.body;

    const category = await categories.findById(categoryId);

    if (!category) {
      req.flash('error', 'Category not found');
      return res.redirect("/admin/categories");
    }

    await category.deleteOne({ _id: categoryId });

    req.flash('success', 'Category deleted successfully');
    res.redirect("/admin/categories");
  } catch (error) {
    console.error("Error deleting category:", error);
    req.flash('error', 'Failed to delete category');
    res.redirect("/admin/categories");
  }
};
