import { validationResult } from "express-validator";
import User from "../models/users.js";
import bcrypt from "bcryptjs";
import Cart from "../models/cart.js";
import Orders from "../models/orders.js";

export const signup = async (req, res, next) => {
    try {
        const errors=validationResult(req);
        if(!errors.isEmpty())
        {
            
            return res.json(errors.array())
        }
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 12);
        const newUser = new User({
            username: username,
            email: email,
            password: hashedPassword,
            role: 1,
            status: 0,
        });
        const result = await newUser.save();
        res.status(201).json({ message: "User created Successfully" })
    } catch (error) {
        res.status(500).json({ message: "Failed to create user. Please try again later." });
    }
}
export const login = async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.json(errors.array());
      }

      const { email, password,sessionID } = req.body;

      const user = await User.findOne({ email: email ,role:1});
      if (!user) {
        return res.json({ message: 'Email does not exist' });
      }

      const passwordCheck = await bcrypt.compare(password, user.password);
      if (!passwordCheck) {
        return res.json({ message: 'Password is incorrect' });
      }

      req.session.userAuthenticated = true;
      req.session.isAdminLogged = false;
      req.session.user = user;
      // if(sessionID)
      // {
      //   const cart= await Cart.findOneAndDelete({dummy_user_id:sessionID});
      // }
      res.json({ status: 200, message: "User Logged Successfully" });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ message: "Failed to log in. Please try again later." });
    }
  };

export const logout = async (req, res, next) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Error destroying session:', err);
                return res.status(500).json({ message: "Failed to log out. Please try again." });
            }
            res.json({status: 200, message: "Logout successful." });
        });
    } catch (error) {
        console.error('Error in logout:', error);
        res.status(500).json({ message: "An error occurred. Please try again." });
    }
};

export const authStatus=(req, res,next) => {
  if (req.session.userAuthenticated) {
      res.json({ isAuthenticated: true });
  } else {
      res.json({ isAuthenticated: false });
  }
};
export const getProfile = async (req,res,next)=>{
  res.render("profile",{
    pageTitle:"Profile",
    activePage:"profile"
  });
}
export const profile = async (req, res, next) => {
  const userId = req.session.userAuthenticated ? req.session.user._id : null;

  if (userId) {
      try {
          const user = await User.findById(userId);
          const orders = await Orders.find({ 'user.userId': userId })
  .sort({ created_at: -1 })
  .limit(1)
  .populate('products.sps_id')
  .populate('products.car_id');

          const updatedOrders = orders.map((c) => {
            const formattedDate = new Date(c.createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour:"2-digit",
              minute:"2-digit",
              second:"2-digit"
            });
            return { ...c.toObject(), createdTime: formattedDate };
          });
          res.json({ user, orders:updatedOrders });
      } catch (error) {
          console.error('Error fetching user profile:', error);
          res.status(500).json({ error: 'Failed to fetch user profile' });
      }
  } else {
      res.status(403).json({ error: 'User not authenticated' });
  }
};
export const updateUserDetails= async (req,res,next)=>{
  try {
      const userId = req.session.userAuthenticated ? req.session.user._id : null;
      if(userId)
      {
          const {firstname,lastname,email,mobile,address,pincode} = req.body;

          let order = await Orders.findOne().sort({ created_at: -1 });
          console.log('order',order);
          order.user.firstname=firstname;
          order.user.lastname=lastname;
          order.user.email=email;
          order.user.mobile=mobile;
          order.user.address=address;
          order.user.pincode=pincode;
          order.save();

          res.json({status: 200, message: "Updated successfully." });
      }
      
      // const user=await User.find

      // console.log('req.body',req.body);

  } catch (error) {
      console.log('error',error);
      
  }
}