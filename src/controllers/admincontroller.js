import Car from "../models/cars.js";
import Brand from "../models/brands.js";
import SP from "../models/spareparts.js";
import SPC from "../models/sparepartscategories.js";
import { validationResult } from "express-validator";
import { deleteFile } from "../config/fileunlink.js";
import multer from "multer";
import { upload } from "../config/imagefile.js";
import Payment from "../models/payment.js";

const spImages = upload.array("images", 10);

export const getBrandLists = async (req, res, next) => {
  try {
    const brands = await Brand.find({deletedAt:null});
    const brandsWithTime = brands.map((brand) => {
      const formattedDate = new Date(brand.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );

      return {
        ...brand.toObject(),
        createdTime: formattedDate,
      };
    });
    res.render("admin/brands/index", {
      pageTitle: "Admin | Brands",
      brands: brandsWithTime,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
export const getCreateBrand = async (req, res, next) => {
  try {
    res.render("admin/brands/add", {
      pageTitle: "Admin | Brands | Create",
      errorMessage: null,
      oldInput: { name: "" },
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

    if (!errors.isEmpty() || !req.file) {
      const allErrors = [...errors.array()];

      if (!req.file) {
        const imageError = {
          type: "field",
          value: "",
          msg: "Image field is required",
          path: "brandImage",
          location: "body",
        };
        allErrors.push(imageError);
      }

      return res.render("admin/brands/add", {
        pageTitle: "Admin | Brands | Create",
        errorMessage: "Validation failed. Please check the errors below.",
        oldInput: { name: req.body.name },
        validationErrors: allErrors,
      });
    }

    const relativePath = `images/${req.file.filename}`;
    const { name } = req.body;
    // const brandName = await Brand.findOne({ name });
    // if (brandName) {
    //   const nameErrors = [...errors.array()]; 
  
    //   const nameError = {
    //     type: 'field',
    //     value: '',
    //     msg: 'The name already exists',
    //     path: 'name',
    //     location: 'body',
    //   };
    //   nameErrors.push(nameError);
    //   return res.status(422).render("admin/brands/add", {
    //     pageTitle: "Admin | Brands | Create",
    //     oldInput: { name: req.body.name },
    //     validationErrors: nameErrors,
    //   });
    // } else {
      const b = new Brand({
        name: name,
        image: relativePath,
        status: 0,
      });
      await b.save();
      req.flash('success', 'Brand Created Successfully');
      res.redirect("/admin/brands");
    // }
  } catch (error) {
    req.flash('error', 'Brand Create Failed!');
    console.log(error);
  }
};

export const getEditBrand = async (req, res, next) => {
  try {
    const brandId = req.params.brandId;
    const brand = await Brand.findById(brandId);
    if (brand) {
      res.render("admin/brands/edit", {
        brand: brand,
        pageTitle: "Admin | Brands | Edit",
        errorMessage: null,
        validationErrors: [],
      });
    } else {
      res.redirect("/admin/brands");
    }
  } catch (error) {
    res.redirect("/admin/brands");
    // console.log(error);
    // res.status(500).json({ message: "Server Error" });
  }
};
export const editBrand = async (req, res, next) => {
  try {
    const { name, brandId } = req.body;
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).render("admin/brands/edit", {
        pageTitle: "Admin | Brands | Edit",
        errorMessage: errors.array()[0].msg,
        brand: { name, _id: brandId },
        validationErrors: errors.array(),
      });
    }

    const existingBrand = await Brand.findById(brandId);

    if (!existingBrand) {
      return res.status(404).render("admin/brands/edit", {
        pageTitle: "Admin | Brands | Edit",
        errorMessage: "Brand not found",
        brand: { name, _id: brandId },
        validationErrors: [],
      });
    }

    const brandName = await Brand.findOne({ name, _id: { $ne: brandId } });

    if (brandName) {
      return res.status(422).render("admin/brands/edit", {
        pageTitle: "Admin | Brands | Edit",
        errorMessage: "The name already exists",
        brand: { name, _id: brandId },
        validationErrors: [],
      });
    }

    if (req.file) {
      await deleteFile(existingBrand.image);

      existingBrand.image = `images/${req.file.filename}`;
    }

    existingBrand.name = name;

    await existingBrand.save();
    req.flash('success', 'Brand Update Successfully');
    res.redirect("/admin/brands");
  } catch (error) {
    req.flash('error', 'Brand Update Failed!');
    // console.log(error);
    // next(error);
  }
};




export const softDeleteBrand = async(req,res,next)=>{
  try {
    const brandId = req.body.brandId;
    const findBrand = await Brand.findByIdAndUpdate(
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
export const restoreBrand = async(req,res,next)=>{
  try {
    const brandId = req.params.brandId;
    const findBrand = await Brand.findByIdAndUpdate(
      brandId,
      { deletedAt: null },
      { new: true }
    );
    if (findBrand) {
      req.flash("success", "Brand Restored Successfully");
      return res.redirect("/admin/brands/trash");
    } else {
      req.flash("error", "Brand not found");
      return res.redirect("/admin/brands/trash");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Brand Restore Failed");
    return res.redirect("/admin/brands/trash");
  }
}

export const getTrashedBrandLists= async (req,res,next) =>{
  try {
    const brands = await Brand.find({deletedAt:{$ne:null}});
    const brandsWithTime = brands.map((brand) => {
      const formattedDate = new Date(brand.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );

      return {
        ...brand.toObject(),
        createdTime: formattedDate,
      };
    });
    res.render("admin/brands/trash", {
      pageTitle: "Admin | Brands",
      brands: brandsWithTime,
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
}

export const deleteBrand = async (req, res, next) => {
  try {
    const brandId = req.body.brandId;
    const brand = await Brand.findById(brandId);

    if (!brand) {
      req.flash('error', 'Brand not found');
      return res.redirect("/admin/brands");
    }

    const cars = await Car.find({ brand: brandId });

    for (const car of cars) {
      const spareParts = await SP.find({ carId: car._id });

      for (const sp of spareParts) {
        if (Array.isArray(sp.images)) {
          for (const image of sp.images) {
            await deleteFile(image);
          }
        } else if (sp.images) {
          await deleteFile(sp.images);
        }
        await sp.deleteOne(); 
      }

      if (Array.isArray(car.images)) {
        for (const image of car.images) {
          await deleteFile(image);
        }
      } else if (car.images) {
        await deleteFile(car.images);
      }
      await car.deleteOne();
    }

    if (brand.image) {
      await deleteFile(brand.image);
    }
    
    await brand.deleteOne();

    req.flash('success', 'Brand deleted successfully');
    res.redirect("/admin/brands");
  } catch (error) {
    console.error(error);
    req.flash('error', 'Failed to delete brand');
    res.redirect("/admin/brands");
  }
};



export const getCarLists = async (req, res, next) => {
  try {
    const cars = await Car.find({deletedAt:null}).populate("brand");
    const updatedCars = cars.map((c) => {
      const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return { ...c.toObject(), createdTime: formattedDate };
    });
    res.render("admin/cars/index", {
      cars: updatedCars,
      pageTitle: "Admin | Cars",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getCreateCar = async (req, res, next) => {
  try {
    const brands = await Brand.find();
    res.render("admin/cars/add", {
      pageTitle: "Admin | Cars | Create",
      brands: brands,
      errorMessage: null,
      oldInput: { bname: "", name: "", price: "", desc: "" },
      validationErrors: [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createCar = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const brands = await Brand.find();
    const allErrors = [...errors.array()];
    if (!req.files || req.files.length === 0) {
      const imageError = {
        type: "field",
        value: "",
        msg: "Image field is required",
        path: "carImages",
        location: "body",
      };
      allErrors.push(imageError);
    }
    if (req.files && req.files.length > 10) {
      const imageError = {
        type: "field",
        value: "",
        msg: "You can upload a maximum of 10 images",
        path: "carImages",
        location: "body",
      };
      allErrors.push(imageError);
    }
    if (!errors.isEmpty() || allErrors.length > 0) {
      return res.render("admin/cars/add", {
        pageTitle: "Admin | Cars | Create",
        brands: brands,
        errorMessage: "Validation failed. Please check the errors below.",
        oldInput: {
          bname: req.body.bname,
          name: req.body.name,
          price: req.body.price,
          desc: req.body.desc,
          is_published: req.body.is_published,
        },
        validationErrors: allErrors,
      });
    }

    const relativePaths = req.files.map((file) => `images/${file.filename}`);

    const { bname, name, price, desc, is_published } = req.body;
    const carName = await Car.findOne({ name });
    if (carName) {
      return res.status(422).render("admin/brands/add", {
        pageTitle: "Admin | Cars | Create",
        brands: brands,
        errorMessage: "The name is already exist",
        oldInput: {
          bname: req.body.bname,
          name: req.body.name,
          price: req.body.price,
          desc: req.body.desc,
          is_published: req.body.is_published,
        },
        validationErrors: [],
      });
    } else {
      const b = new Car({
        name: name,
        price: price,
        description: desc,
        images: relativePaths,
        status: req.body.is_published ? 0 : 1,
        brand: bname,
      });
      await b.save();
      req.flash('success', 'Car Created Successfully');
      res.redirect("/admin/cars");
    }
  } catch (error) {
    req.flash('error', 'Failed to create car');
    res.redirect("/admin/spareparts");
  }
};

export const getEditCar = async (req, res, next) => {
  try {
    const carId = req.params.carId;
    const car = await Car.findById(carId);
    const brands = await Brand.find();
    if (car) {
      res.render("admin/cars/edit", {
        car: car,
        brands: brands,
        pageTitle: "Admin | Cars | Edit",
        errorMessage: null,
        validationErrors: [],
      });
    } else {
      res.redirect("/admin/cars");
    }
  } catch (error) {
    res.redirect("/admin/cars");
  }
};

export const updateCar = async (req, res, next) => {
  try {
    const { bname, name, price, desc, is_published, carId } = req.body;
    const errors = validationResult(req);
    const brands = await Brand.find();
    const findCar = await Car.findById(carId);

    if (!findCar) {
      req.flash('error', 'Car not found');
      return res.redirect("/admin/cars");
    }

    if (!errors.isEmpty()) {
      return res.render("admin/cars/edit", {
        pageTitle: "Admin | Cars | Edit",
        brands: brands,
        errorMessage: "Validation failed. Please check the errors below.",
        car: {
          brand: bname,
          name: name,
          price: price,
          description: desc,
          images: findCar.images,
          status: is_published,
          _id: carId,
        },
        validationErrors: errors.array(),
      });
    }

    const carName = await Car.findOne({ name, _id: { $ne: carId } });

    if (carName) {
      const allErrors = errors.array();
      const nameError = {
        value: name,
        msg: "The name already exists",
        param: "name",
        location: "body",
      };
      allErrors.push(nameError);

      return res.status(422).render("admin/cars/edit", {
        pageTitle: "Admin | Cars | Edit",
        brands: brands,
        errorMessage: "The name already exists",
        car: {
          brand: bname,
          name: name,
          price: price,
          description: desc,
          images: findCar.images,
          status: is_published,
          _id: carId,
        },
        validationErrors: allErrors,
      });
    }

    if (req.files && req.files.length > 0) {
      if (Array.isArray(findCar.images)) {
        for (const image of findCar.images) {
          await deleteFile(image);
        }
      } else if (findCar.images) {
        await deleteFile(findCar.images);
      }
    }

    const images =
      req.files && req.files.length > 0
        ? req.files.map((file) => `images/${file.filename}`)
        : findCar.images;

    findCar.brand = bname;
    findCar.name = name;
    findCar.price = price;
    findCar.description = desc;
    findCar.images = images;
    findCar.status = is_published ? 0 : 1;

    await findCar.save();
    req.flash('success', 'Car updated Successfully');
    res.redirect("/admin/cars");
  } catch (error) {
    const brands = await Brand.find();
    res.status(500).render("admin/cars/edit", {
      pageTitle: "Admin | Cars | Edit",
      brands: brands,
      errorMessage: "An unexpected error occurred. Please try again later.",
      car: {
        brand: req.body.bname,
        name: req.body.name,
        price: req.body.price,
        description: req.body.desc,
        images: findCar ? findCar.images : [],
        status: req.body.is_published,
        _id: req.body.carId,
      },
      validationErrors: [],
    });
  }
};

export const getTrashedCarLists = async (req, res, next) => {
  try {
    const cars = await Car.find({deletedAt:{$ne:null}}).populate("brand");
    const updatedCars = cars.map((c) => {
      const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return { ...c.toObject(), createdTime: formattedDate };
    });
    res.render("admin/cars/trash", {
      cars: updatedCars,
      pageTitle: "Admin | Cars",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};


export const softDeleteCar = async (req,res,next)=>{
  try {
    const carId = req.body.carId;
    const findCar = await Car.findByIdAndUpdate(
      carId,
      { deletedAt: new Date() },
      { new: true }
    );
    if (findCar) {
      req.flash("success", "Car Deleted Successfully");
      return res.redirect("/admin/cars");
    } else {
      req.flash("error", "Car not found");
      return res.redirect("/admin/cars");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Car Deletion Failed");
    return res.redirect("/admin/cars");
  }
}

export const restoreCar = async (req,res,next)=>{
  try {
    const carId = req.params.carId;
    const findCar = await Car.findByIdAndUpdate(
      carId,
      { deletedAt: null },
      { new: true }
    );
    if (findCar) {
      req.flash("success", "Car Restored Successfully");
      return res.redirect("/admin/cars/trash");
    } else {
      req.flash("error", "Car not found");
      return res.redirect("/admin/cars/trash");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Car Restore Failed");
    return res.redirect("/admin/cars/trash");
  }
}

export const deleteCar = async (req, res, next) => {
  try {
    const carId = req.body.carId;
    const car = await Car.findById(carId);
    if (!car) {
      req.flash('error', 'Car not found');
      return res.redirect("/admin/cars");
    }

    const spareParts = await SP.find({ carId: carId });


    for (const sp of spareParts) {
      if (Array.isArray(sp.images)) {
        for (const image of sp.images) {
          await deleteFile(image);
        }
      } else if (sp.images) {
        await deleteFile(sp.images);
      }
      await sp.deleteOne(); 
    }

    if (Array.isArray(car.images)) {
      for (const image of car.images) {
        await deleteFile(image);
      }
    } else if (car.images) {
      await deleteFile(car.images);
    }

    await car.deleteOne();

    req.flash('success', 'Car and associated spare parts deleted successfully');
    res.redirect("/admin/cars/trash");
  } catch (error) {
    console.log(error);
    req.flash('error', 'Failed to delete the car');
    res.redirect("/admin/cars/trash");
  }
};


// spare parts

export const getCarSparePartsLists = async (req, res, next) => {
  try {
    const sp = await SP.find({ deletedAt: null }).populate('category');
    const updatedSP = sp.map((c) => {
      const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return { ...c.toObject(), createdTime: formattedDate };
    });

    res.render("admin/spareparts/index", {
      sp: updatedSP,
      pageTitle: "Admin | Cars | Spare Parts",
    });
  } catch (error) {
    req.flash("error", "Server Error");
    res.redirect("/admin/spareparts");
  }
};

export const getCreateSpareParts = async (req, res, next) => {
  try {
    const spc = await SPC.find();
    res.render("admin/spareparts/add", {
      pageTitle: "Admin | Cars | Spare Parts | Create",
      spc:spc,
      oldInput: {
        category: "",
        name: "",
        price: "",
        desc: "",
        status: 0,
      },
      validationErrors: [],
    });
  } catch (error) {
    req.flash("error", "Server Error");
    res.redirect("/admin/spareparts");
    // console.log(error);
  }
};

export const createSpareParts = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const spc = await SPC.find();
    const allErrors = [...errors.array()];

    if (!req.files || req.files.length === 0) {
      const imageError = {
        type: 'field',
        value: '',
        msg: 'Image field is required',
        path: 'images',
        location: 'body',
      };
      allErrors.push(imageError);
    }

    if (!errors.isEmpty() || allErrors.length > 0) {
      return res.render("admin/spareparts/add", {
        pageTitle: "Admin | Cars | Spare Parts | Create",
        spc:spc,
        oldInput: {
          category: req.body.category,
          name: req.body.name,
          price: req.body.price,
          desc: req.body.desc,
          status: req.body.status,
        },
        validationErrors: allErrors,
      });
    }

    const relativePaths = req.files.map(file => `images/${file.filename}`);
    const {category, name, price, desc, status } = req.body;

    const existingSP = await SP.findOne({ name });
    if (existingSP) {
      const nameErrors = [...errors.array()]; 

      const nameError = {
        type: 'field',
        value: '',
        msg: 'The name already exists',
        path: 'name',
        location: 'body',
      };
      nameErrors.push(nameError);

      return res.status(422).render("admin/spareparts/add", {
        pageTitle: "Admin | Cars | Spare Parts | Create",
        spc:spc,
        oldInput: {
          category: category,
          name: name,
          price: price,
          desc: desc,
          status: status,
        },
        validationErrors: nameErrors, 
      });
    }

    const newSP = new SP({
      category: category,
      name: name,
      price: price,
      description: desc,
      images: relativePaths,
      status: status ? 0 : 1,
    });

    await newSP.save();

    req.flash('success', 'Spare Parts Created Successfully');
    res.redirect("/admin/spareparts");

  } catch (error) {
    console.log(error);
    req.flash('error', 'Failed to create Spare Parts');
    res.redirect("/admin/spareparts");
  }
}


export const getEditSpareParts = async (req, res, next) => {
  try {
    const sp = await SP.findById(req.params.spId);
    const  spc = await SPC.find();
    res.render("admin/spareparts/edit", {
      pageTitle: "Admin | Cars | Spare Parts | Edit",
      spc:spc,
      sp: sp,
      validationErrors: [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const updateSpareParts = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    const findSP = await SP.findById(req.body.spId);

    if (!findSP) {
      const spIdErrors = [...errors.array()];
      const spIdError = {
        type: "field",
        value: "",
        msg: "Spare Parts id is not found",
        path: "spId",
        location: "body",
      };
      spIdErrors.push(spIdError);

      return res.render("admin/spareparts/edit", {
        pageTitle: "Admin | Cars | Spare Parts | Edit",
        errorMessage: "Spare Parts id is not found",
        sp: {
          category: req.body.category,
          name: req.body.name,
          price: req.body.price,
          description: req.body.desc,
          images: findSP.images,
          _id: findSP._id,
          status: req.body.status,
        },
        validationErrors: spIdErrors,
      });
    }

    if (!errors.isEmpty()) {
      return res.render("admin/spareparts/edit", {
        pageTitle: "Admin | Cars | Spare Parts | Edit",
        errorMessage: "Validation failed. Please check the errors below.",
        sp: {
          category: req.body.category,
          name: req.body.name,
          price: req.body.price,
          description: req.body.desc,
          images: findSP.images,
          _id: findSP._id,
          status: req.body.status,
        },
        validationErrors: errors.array(),
      });
    }

    if (req.files && req.files.length > 0) {
      if (Array.isArray(findSP.images)) {
        for (const image of findSP.images) {
          await deleteFile(image);
        }
      } else if (findSP.images) {
        await deleteFile(findSP.images);
      }
    }

    const images =
      req.files && req.files.length > 0
        ? req.files.map((file) => `images/${file.filename}`)
        : findSP.images;

    const { category, name, price, desc, status, spId } = req.body;

    const spName = await SP.findOne({ name, _id: { $ne: spId } });
    if (spName) {
      const nameErrors = [...errors.array()];
      const nameError = {
        type: "field",
        value: "",
        msg: "The name already exists",
        path: "name",
        location: "body",
      };
      nameErrors.push(nameError);

      return res.status(422).render("admin/spareparts/edit", {
        pageTitle: "Admin | Cars | Spare Parts | Edit",
        errorMessage: "The name already exists",
        sp: {
          category: req.body.category,
          name: req.body.name,
          price: req.body.price,
          description: req.body.desc,
          images: findSP.images,
          _id: findSP._id,
          status: req.body.status,
        },
        validationErrors: nameErrors,
      });
    } else {
      findSP.category = category;
      findSP.name = name;
      findSP.price = price;
      findSP.description = desc;
      findSP.images = images;
      findSP.status = status ? 0 : 1;

      await findSP.save();

      req.flash("success", "Spare Parts is created successfully");
      res.redirect("/admin/spareparts");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const softDeleteSpareParts = async (req, res, next) => {
  try {
    const spId = req.body.spId;
    const findSP = await SP.findByIdAndUpdate(
      spId,
      { deletedAt: new Date() },
      { new: true }
    );
    if (findSP) {
      req.flash("success", "Spare Parts Deleted Successfully");
      return res.redirect("/admin/spareparts");
    } else {
      req.flash("error", "Spare Parts not found");
      return res.redirect("/admin/spareparts");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Spare Parts Deletion Failed");
    return res.redirect("/admin/spareparts");
  }
};

export const getTrashedCarSparePartsLists = async (req, res, next) => {
  try {
    const sp = await SP.find({ deletedAt: { $ne: null } });
    const updatedSP = sp.map((c) => {
      const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return { ...c.toObject(), createdTime: formattedDate };
    });

    res.render("admin/spareparts/trash", {
      sp: updatedSP,
      pageTitle: "Admin | Cars | Spare Parts",
    });
  } catch (error) {
    req.flash("error", "Server Error");
    res.redirect("/admin/spareparts/trash");
  }
};

export const restoreSpareParts = async (req, res, next) => {
  try {
    const spId = req.params.spId;
    const findSP = await SP.findByIdAndUpdate(
      spId,
      { deletedAt: null },
      { new: true }
    );
    if (findSP) {
      req.flash("success", "Spare Parts Restored Successfully");
      return res.redirect("/admin/spareparts/trash");
    } else {
      req.flash("error", "Spare Parts not found");
      return res.redirect("/admin/spareparts/trash");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Spare Parts Restore Failed");
    return res.redirect("/admin/spareparts/trash");
  }
};

export const deleteSpareParts = async (req, res, next) => {
  try {
    const spId = req.body.spId;
    const findSP = await SP.findById(spId);

    if (findSP) {
      if (Array.isArray(findSP.images)) {
        for (const image of findSP.images) {
          await deleteFile(image);
        }
      } else if (findSP.images) {
        await deleteFile(findSP.images);
      }

      await SP.deleteOne({ _id: spId });

      req.flash("success", "Spare Parts Deleted Successfully");
      return res.redirect("/admin/spareparts/trash");
    } else {
      req.flash("error", "Spare Parts not found");
      return res.redirect("/admin/spareparts/trash");
    }
  } catch (error) {
    console.log(error);
    req.flash("error", "Spare Parts Deletion Failed");
    return res.redirect("/admin/spareparts/trash");
  }
};



// spare parts categories

export const getCarSparePartsCategoriesLists = async (req, res, next) => {
  try {
    const spc = await SPC.find({ deletedAt: null });
    const updatedSPC = spc.map((c) => {
      const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return { ...c.toObject(), createdTime: formattedDate };
    });

    res.render("admin/sparepartscategories/index", {
      spc: updatedSPC,
      pageTitle: "Admin | Cars | Spare Parts Categories",
    });
  } catch (error) {
    req.flash("error", "Server Error");
    res.redirect("/admin/sparepartscategories");
  }
};


export const getCreateCarSparePartsCategories = async (req, res, next) => {
  try {
    const cars = await Car.find();
    res.render("admin/sparepartscategories/add", {
      pageTitle: "Admin | Cars | Spare Parts Categories | Create",
      cars: cars,
      oldInput: {
        name: "",
      },
      validationErrors: [],
    });
  } catch (error) {
    req.flash("error", "Server Error");
    res.redirect("/admin/sparepartscategories");
    // console.log(error);
  }
};

export const createCarSparePartsCategories = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty() || errors.length > 0) {
      return res.render("admin/sparepartscategories/add", {
        pageTitle: "Admin | Cars | Spare Parts Categories | Create",
        oldInput: {
          name: req.body.name,
        },
        validationErrors: errors.array(),
      });
    }
const existingSPC = await SPC.findOne({ name:req.body.name });
if (existingSPC) {
  const nameErrors = [...errors.array()]; 
  
  const nameError = {
    type: 'field',
    value: '',
    msg: 'The name already exists',
    path: 'name',
    location: 'body',
  };
  nameErrors.push(nameError);
  
  return res.status(422).render("admin/sparepartscategories/add", {
    pageTitle: "Admin | Cars | Spare Parts | Create",
    oldInput: {
      name: req.body.name,
    },
    validationErrors: nameErrors, 
  });
}

const newSPC = new SPC({
      name: req.body.name,
    });

    await newSPC.save();

    req.flash('success', 'Spare Parts Category Created Successfully');
    res.redirect("/admin/sparepartscategories");

  } catch (error) {
    req.flash('error', 'Failed to create Spare Parts Category');
    res.redirect("/admin/sparepartscategories");
  }
}

export const getEditSparePartsCategories = async (req, res, next) => {
  try {
    const spc = await SPC.findById(req.params.spcId);
    if(!spc)
    {
      req.flash('error',"Spare Part Category is not found");
      res.redirect('/admin/sparepartscategories')
    }
    res.render("admin/sparepartscategories/edit", {
      pageTitle: "Admin | Cars | Spare Parts Categories | Edit",
      spc: spc,
      validationErrors: [],
    });
  } catch (error) {
    req.flash('error',"Server Error");
    res.redirect('/admin/sparepartscategories')
  }
};

export const updateSparePartsCategory = async (req, res, next) => {
  try {
    const errors = validationResult(req);
console.log('id',req.body.spcId)
    const findSPC = await SPC.findById(req.body.spcId);
    if (!findSPC) {
      req.flash('error', 'Spare Parts Category ID is not found');
      return res.redirect('/admin/sparepartscategories');
    }

    if (!errors.isEmpty()) {
      return res.render("admin/sparepartscategories/edit", {
        pageTitle: "Admin | Cars | Spare Parts Category | Edit",
        spc: {
          _id: findSPC._id,
          name: req.body.name,
        },
        validationErrors: errors.array(),
        messages: req.flash('error'),
      });
    }

    const spcName = await SPC.findOne({ name: req.body.name, _id: { $ne: req.body.spcId } });
    if (spcName) {
      const nameError = {
        type: "field",
        value: req.body.name,
        msg: "The name already exists",
        path: "name",
        location: "body",
      };
      const nameErrors = [...errors.array(), nameError];

      return res.status(422).render("admin/sparepartscategories/edit", {
        pageTitle: "Admin | Cars | Spare Parts Category | Edit",
        spc: {
          _id: findSPC._id,
          name: req.body.name,
        },
        validationErrors: nameErrors,
        messages: req.flash('error'),
      });
    }

    findSPC.name = req.body.name;
    await findSPC.save();

    req.flash("success", "Spare Parts Category is updated successfully");
    res.redirect("/admin/sparepartscategories");

  } catch (error) {
    req.flash("error", "Failed to update Spare Parts Category");
    res.redirect("/admin/sparepartscategories");
  }
};

export const getTrashedCarSparePartsCategoriesLists = async (req, res, next) => {
  try {
    const spc = await SPC.find({ deletedAt:{$ne:null}});
    const updatedSPC = spc.map((c) => {
      const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
      return { ...c.toObject(), createdTime: formattedDate };
    });

    res.render("admin/sparepartscategories/trash", {
      spc: updatedSPC,
      pageTitle: "Admin | Cars | Spare Parts Categories",
    });
  } catch (error) {
    req.flash("error", "Server Error");
    res.redirect("/admin/sparepartscategories");
  }
};


export const softDeleteSparePartsCategory = async (req, res, next) => {
  try {
    const spcId = req.body.spcId;
    const findSPC = await SPC.findByIdAndUpdate(
      spcId,
      { deletedAt: new Date() },
      { new: true }
    );
    if (findSPC) {
      req.flash("success", "Spare Parts Category Deleted Successfully");
      return res.redirect("/admin/sparepartscategories");
    } else {
      req.flash("error", "Spare Parts Category not found");
      return res.redirect("/admin/sparepartscategories");
    }
  } catch (error) {
    req.flash("error", "Spare Parts Deletion Failed");
    return res.redirect("/admin/sparepartscategories");
  }
};

export const restoreSparePartsCategory = async (req, res, next) => {
  try {
    const spcId = req.params.spcId;
    const findSPC = await SPC.findByIdAndUpdate(
      spcId,
      { deletedAt: null },
      { new: true }
    );
    if (findSPC) {
      req.flash("success", "Spare Parts Category Restored Successfully");
      return res.redirect("/admin/sparepartscategories/trash");
    } else {
      req.flash("error", "Spare Parts Category not found");
      return res.redirect("/admin/sparepartscategories/trash");
    }
  } catch (error) {
    req.flash("error", "Spare Parts Category Restore Failed");
    return res.redirect("/admin/sparepartscategories/trash");
  }
};

export const deleteSparePartsCategory = async (req, res, next) => {
  try {
    const spcId = req.body.spcId;
    const findSPC = await SPC.findById(spcId);

    if (!findSPC) {
      req.flash("error", "Spare Parts Category not found");
      return res.redirect("/admin/sparepartscategories/trash");
    }

    const findSP = await SP.find({ category: findSPC._id });

    if (findSP && findSP.length > 0) {
      for (const sparePart of findSP) {
        if (Array.isArray(sparePart.images)) {
          for (const image of sparePart.images) {
            await deleteFile(image);
          }
        } else if (sparePart.images) {
          await deleteFile(sparePart.images);
        }
        await sparePart.deleteOne();
      }
    }

    await findSPC.deleteOne();

    req.flash("success", "Spare Parts Category deleted successfully");
    res.redirect("/admin/sparepartscategories/trash");
  } catch (error) {
    console.error(error);
    req.flash("error", "Failed to delete Spare Parts Category");
    res.redirect("/admin/sparepartscategories/trash");
  }
};

export const getOrders = async(req,res,next)=>
{
  const payment = await Payment.find().populate('userId').populate('products.car_id').populate('products.sps_id');
  const paymentWithTime = payment.map((payment) => {
    const formattedDate = new Date(payment.createdAt).toLocaleDateString(
      "en-US",
      {
        year: "numeric",
        month: "short",
        day: "numeric",
      }
    );

    return {
      ...payment.toObject(),
      createdTime: formattedDate,
    };
  });
  res.render('admin/orders/index',{
    pageTitle:"Orders",
    payment:paymentWithTime
  });
}