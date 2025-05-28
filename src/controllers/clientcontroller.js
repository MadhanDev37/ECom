import mongoose from "mongoose";
import Car from "../models/cars.js";
import SP from "../models/spareparts.js";
import SPC from "../models/sparepartscategories.js";
import brands from "../models/brands.js";
import products from "../models/products.js";
import categories from "../models/categories.js";

export const getIndex = async (req, res, next) => {
    try {
        const brand = await brands.find(); 
        const category = await categories.find();
        const product= await products.find();
        res.render('index', { 
        pageTitle:"Electro Cart",
        categories:category,
        product:product,
        currentPage:"home"
    }); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};
export const getAllProductsPage = async (req, res, next) => {
    try {
        const brand = await brands.find(); 
        const category = await categories.find();
        const product= await products.find();
        res.render('products', { 
        pageTitle:"Electro Cart",
        categories:category,
        product:product,
        currentPage:"products"
    }); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getAllProducts = async (req, res, next) => {
  try {
    const productsList = await products.find({ deletedAt: null }).populate("brand");
    console.log('products', productsList);

    res.json({ status: 200, data: productsList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getProductsDetailPage = async (req, res, next) => {
    try {
        const id= req.body.id;
        const brand = await brands.find(); 
        const category = await categories.find();
        const product= await products.findById(id);
        res.render('details', { 
        pageTitle:"Electro Cart",
        categories:category,
        product:product,
        currentPage:"details"
    }); 
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};
// export const getHomeCars = async (req, res, next) => {
//     try {
//         // const brands = await Brand.find(); 
//         // console.log('price',req.body)
//         const cars= await Car.find({price:{$gte:req.body.minprice,$lte:req.body.maxprice}});

//     res.json(cars);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };
// export const getHomeSparePartsCategories = async (req, res, next) => {
//     try {
//         const spc= await SPC.find();
//     res.json(spc);
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// export const getHomeSpareParts = async(req,res,next) =>{
// try {

//     const sp = await SP.find({category:req.body.sortSpsc});
//     if(sp.length>0)
//     {

//         res.json(sp);
//     }else
//     {
//         res.json([]);
//     }
// } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Server Error" });
// }
// } 


// // carlist page

// export const getCarLists = async (req, res, next) => {
//     try {
//         const brands = await Brand.find(); 
//         // const cars= await Car.find();
//         res.render('carlist', { 
//         pageTitle:"Car Mart",
//         brands:brands,
//         activePage:"carlist"
//     }); 
//     } catch (error) {
//         console.log(error);
//         res.status(500).json({ message: "Server Error" });
//     }
// };

// export const getAllCars = async (req, res, next) => {
//   try {
//     const { brand, price } = req.body;
//     let query = {};
//     if (Array.isArray(brand)) {
//       const validBrands = await Promise.all(
//         brand.map(async (id) => {
//           if (mongoose.Types.ObjectId.isValid(id)) {
//             const findBrand = await brands.findById(id);
//             return findBrand ? id : null;
//           }
//           return null;
//         })
//       );
//       if(validBrands.length>0)
//       {
//         query.brand = { $in: validBrands.filter(Boolean) }; 
//       }
//     } else if (typeof brand === 'string' && mongoose.Types.ObjectId.isValid(brand)) {
//       const findBrand = await brands.findById(brand);
//       if (findBrand) {
//         query.brand = brand;
//       }
//     }

//     if (Array.isArray(price)) {
//       const priceRanges = price.map((p) => {
//         switch (p) {
//           case "1 - 5 Lakh":
//             return { price: { $gte: 100000, $lte: 500000 } };
//           case "5 - 10 Lakh":
//             return { price: { $gte: 500000, $lte: 1000000 } };
//           case "10 - 15 Lakh":
//             return { price: { $gte: 1000000, $lte: 1500000 } };
//           case "15 - 20 Lakh":
//             return { price: { $gte: 1500000, $lte: 2000000 } };
//           case "20 - 35 Lakh":
//             return { price: { $gte: 2000000, $lte: 3500000 } };
//           case "35 - 50 Lakh":
//             return { price: { $gte: 3500000, $lte: 5000000 } };
//           case "50 - 1 Crore":
//             return { price: { $gte: 5000000, $lte: 10000000 } };
//           case "Above 1 Crore":
//             return { price: { $gte: 10000000, $lte: Number.MAX_SAFE_INTEGER } };
//           default:
//             return null;
//         }
//       }).filter(range => range !== null); 

//       if (priceRanges.length > 0) {
//         query.$or = priceRanges; 
//       }
//     } else if (typeof price === 'string') {
//       switch (price) {
//         case "1 - 5 Lakh":
//           query.price = { $gte: 100000, $lte: 500000 };
//           break;
//         case "5 - 10 Lakh":
//           query.price = { $gte: 500000, $lte: 1000000 };
//           break;
//         case "10 - 15 Lakh":
//           query.price = { $gte: 1000000, $lte: 1500000 };
//           break;
//         case "15 - 20 Lakh":
//           query.price = { $gte: 1500000, $lte: 2000000 };
//           break;
//         case "20 - 35 Lakh":
//           query.price = { $gte: 2000000, $lte: 3500000 };
//           break;
//         case "35 - 50 Lakh":
//           query.price = { $gte: 3500000, $lte: 5000000 };
//           break;
//         case "50 - 1 Crore":
//           query.price = { $gte: 5000000, $lte: 10000000 };
//           break;
//         case "Above 1 Crore":
//           query.price = { $gte: 10000000, $lte: Number.MAX_SAFE_INTEGER };
//           break;
//         default:
//           break;
//       }
//     }

//     // console.log('query',query)
//     const cars = await Car.find(query);

//     res.json(cars);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };

// export const getCarDetails = async(req,res,next)=>{
//   const carId=req.params.carid;
//   if(!mongoose.Types.ObjectId.isValid(carId))
//   {
//     res.redirect('/carlist')
//   }
//   const car= await Car.findById(carId);
//   // console.log('car',car);
//   res.render('cardetails',{
//     pageTitle:"Car Details",
//     car:car,
//     activePage:"carlist"
//   })
// }
  
// // spare parts

// export const getSPSList = async (req, res, next) => {
//   try {
//       const spc = await SPC.find(); 
//       // const cars= await Car.find();
//       res.render('spslist', { 
//       pageTitle:"Car Mart",
//       spc:spc,
//       activePage:"spslist"
//   }); 
//   } catch (error) {
//       console.log(error);
//       res.status(500).json({ message: "Server Error" });
//   }
// };
// export const getAllSps = async (req, res, next) => {
//   try {
//     const { category } = req.body;
//     // console.log('category',category)
//     let query = {};
//     if (Array.isArray(category)) {
//       const validCategories = await Promise.all(
//         category.map(async (id) => {
//           if (mongoose.Types.ObjectId.isValid(id)) {
//             const findCate = await SPC.findById(id);
//             return findCate ? id : null;
//           }
//           return null;
//         })
//       );
//       if(validCategories.length>0)
//       {
//         query.category = { $in: validCategories.filter(Boolean) }; 
//       }
//     } else if (typeof category === 'string' && mongoose.Types.ObjectId.isValid(category)) {
//       const findCate = await SPC.findById(category);
//       if (findCate) {
//         query.category = category;
//       }
//     }
//     const cars = await SP.find(query);

//     res.json(cars);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };
// export const getSPSDetails = async (req, res, next) => {
//   const spsId = req.params.spsid;

//   if (!mongoose.Types.ObjectId.isValid(spsId)) {
//     return res.redirect('/spslist');
//   }

//   try {
//     const sp = await SP.findById(spsId);

//     if (!sp) {
//       return res.redirect('spsdetails');
//     }

//     res.render('spsdetails', {
//       pageTitle: "Spare Parts Details",
//       sps: sp,
//       activePage: "spslist"
//     });
//   } catch (error) {
//     console.error(error);
//     next(error);
//   }
// };

export const getCart = async (req,res,next)=>{
  res.render("cart",{
    pageTitle:"Cart",
   currentPage:"cart"
  });
}

// products

export const getProducts = async (req, res, next) => {
  try {
      const product= await products.find();
  res.json({status:200,data:product});
  } catch (error) {
      console.log(error);
      res.status(500).json({ message: "Server Error" });
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categoriesList = await categories.find({ deletedAt: null });

    const result = await Promise.all(
      categoriesList.map(async (category) => {
        const relatedBrands = await brands.find({ category_id: category._id, deletedAt: null });
        return {
          ...category.toObject(),
          brands: relatedBrands
        };
      })
    );

    res.json({ status: 200, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
export const getProductDetails = async (req, res, next) => {
  try {
    const id= req.body.id;
    const product= await products.findById(id);
    
    res.json({ status: 200, data: product });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
