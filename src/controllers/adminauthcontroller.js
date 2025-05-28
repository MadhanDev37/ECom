import { validationResult } from "express-validator";
import User from "../models/users.js";
import bcrypt from "bcryptjs";
import session from "express-session";
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({ deletedAt: null });
    const updatedUser = users.map((user) => {
      const formattedDate = new Date(user.createdAt).toLocaleDateString(
        "en-US",
        {
          year: "numeric",
          month: "short",
          day: "numeric",
        }
      );

      return { ...user.toObject(), createdTime: formattedDate };
    });
    res.render("admin/users/index", {
      pageTitle: "Users",
      users: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getAddUser = async (req, res, next) => {
  try {
    res.render("admin/users/add", {
      pageTitle: "Admin | Users",
      oldInput: { name: "" },
      validationErrors: [],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const createUser = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("admin/users/add", {
        pageTitle: "Admin | User",
        oldInput: req.body,
        validationErrors: errors.array(),
      });
    }
    const { username, email, password, status } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = new User({
      username: username,
      email: email,
      password: hashedPassword,
      role: 0,
      status: status ? 0 : 1,
    });
    await newUser.save();
    req.flash("success", "User Created Successfully");
    res.redirect("/admin/users");
  } catch (error) {
    req.flash("error", "User Create Failed!");
    res.redirect("/admin/users");
  }
};

export const getEditUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      req.flash("error", "user is not found");
      res.redirect("/admin/users");
    }
    res.render("admin/users/edit", {
      pageTitle: "Admin | Users",
      user: user,
      oldInput: {
        passwordUpdate: 0,
        currentpassword: "",
        password: "",
        cpassword: "",
      },
      validationErrors: [],
    });
  } catch (error) {
    req.flash("error", "user fetch failed");
    res.redirect("/admin/users");
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { userId, username, email, password, status } = req.body;
    const errors = validationResult(req);
    const user = await User.findById(userId);
    if (!user) {
      req.flash("error", "user is not found");
      res.redirect("/admin/users");
    }

    if (!errors.isEmpty()) {
      return res.render("admin/users/edit", {
        pageTitle: "Admin | Users",
        user: user,
        oldInput: {
          passwordUpdate: req.body.passwordUpdate,
          currentpassword: req.body.currentpassword,
          password: req.body.password,
          cpassword: req.body.cpassword,
        },
        validationErrors: errors.array(),
      });
    }

    user.username = username;
    user.email = email;
    if (req.body.passwordUpdate == 1) {
      user.password = await bcrypt.hash(password, 12);
      user.role = 0;
    }
    user.status = status ? 0 : 1;

    await user.save();
    req.flash("success", "User updated Successfully");
    res.redirect("/admin/users");
  } catch (error) {
    req.flash("error", "User update failed");
    res.redirect("/admin/users");
   
  }
};

export const getTrashedUsers = async (req, res, next) => {
    try {
      const users = await User.find({ deletedAt: {$ne:null} });
      const updatedUser = users.map((user) => {
        const formattedDate = new Date(user.createdAt).toLocaleDateString(
          "en-US",
          {
            year: "numeric",
            month: "short",
            day: "numeric",
          }
        );
  
        return { ...user.toObject(), createdTime: formattedDate };
      });
      res.render("admin/users/trash", {
        pageTitle: "Users",
        users: updatedUser,
      });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Server Error" });
    }
};


export const softDeleteUser = async(req,res,next)=>{
    try {
      const userId = req.body.userId;
      const findUser = await User.findByIdAndUpdate(
        userId,
        { deletedAt: new Date() },
        { new: true }
      );
      if (findUser) {
        req.flash("success", "User Deleted Successfully");
        return res.redirect("/admin/users");
      } else {
        req.flash("error", "User not found");
        return res.redirect("/admin/users");
      }
    } catch (error) {
      console.log(error);
      req.flash("error", "User Deletion Failed");
      return res.redirect("/admin/users");
    }
  }
  export const restoreUser = async(req,res,next)=>{
    try {
        const userId = req.params.userId;
        const findUser = await User.findByIdAndUpdate(
          userId,
          { deletedAt: null },
          { new: true }
        );
        if (findUser) {
          req.flash("success", "User Restored Successfully");
          return res.redirect("/admin/users/trash");
        } else {
          req.flash("error", "User not found");
          return res.redirect("/admin/users/trash");
        }
      } catch (error) {
        console.log(error);
        req.flash("error", "User Deletion Failed");
        return res.redirect("/admin/users/trash");
      }
  }

export const deleteUser = async (req, res, next) => {
    try {
        const userId = req.body.userId;
        const findUser = await User.findByIdAndDelete(
          userId,
          { new: true }
        );

        if (findUser) {
          req.flash("success", "User Deleted Successfully");
          return res.redirect("/admin/users/trash");
        } else {
          req.flash("error", "User not found");
          return res.redirect("/admin/users/trash");
        }
      } catch (error) {
        console.log(error);
        req.flash("error", "User Deletion Failed");
        return res.redirect("/admin/users/trash");
      }
  };

export const getLogin  = async (req,res,next) =>{
  try {
    res.render('admin/login',
      {
        pageTitle:"Admin | Login",
        oldInput:{email:"",password:""},
        validationErrors:[]
      }
    )
  } catch (error) {
    res.status(500).json({message:"Server Error"});
  }
} 

export const login = async (req,res,next) =>{
  try {
    
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.render("admin/login", {
        pageTitle: "Login",
        oldInput: req.body,
        validationErrors: errors.array(),
      });
    }
    const findUser=await User.findOne({email:req.body.email,role:0});
    console.log(findUser,'findUser');
    
    if (!findUser) {
      return res.json({ message: 'Email does not exist' });
    }

     const passwordCheck = await bcrypt.compare(req.body.password, findUser.password);
          if (!passwordCheck) {
            return res.json({ message: 'Password is incorrect' });
          }

 
    req.session.isAdminLogged=true;
    req.session.user=findUser;
    await req.session.save();
    console.log('comming inside');
    res.redirect('/admin/brands');
    console.log('going outside');

  } catch (error) {
    
  }
}  
export const logout = async (req,res,next) =>{
  try {
    
  await req.session.destroy()

    res.redirect('/admin/login')

  } catch (error) {
    console.error('Error destroying session:', error);
    
    // Optionally, pass the error to the next middleware
    // next(error);
  }
}  


