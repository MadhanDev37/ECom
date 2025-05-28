import express from 'express';
import path from 'path';
import { config as configDotenv } from 'dotenv';
import session from 'express-session';
import flash from 'connect-flash';
import connectDb from './config/db.js';
// import carRouter from './routes/cars.js';
import adminRouter from './routes/admin.js';
import clientRouter from './routes/client.js';
import { fileURLToPath } from 'url';
import multer from 'multer';
import connectMongoDBSession from 'connect-mongodb-session';
import users from './models/users.js';
const MongoDBStore = connectMongoDBSession(session);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

configDotenv();
const app = express();
const store = new MongoDBStore({
  uri:process.env.MONGODB_URL,
  collection:'sessions'
})
app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false, //session will not be saved back to the store unless it was modified
    saveUninitialized: false, //a session will not be created unless something is stored 
    store: store, //The session store instance.
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 
    }
  }));
  
app.use(flash());
app.use((req, res, next) => {
  if (req.session && req.session.user) {
    res.locals.isAdminAuthenticated = req.session.isAdminLogged;
    res.locals.authAdminUserName = req.session.user.username;
    res.locals.isClientAuthenticated = req.session.userAuthenticated;
    res.locals.userId=req.session.user._id;
  } else {
    res.locals.isAdminAuthenticated = false; 
    res.locals.isClientAuthenticated = false;
    res.locals.authAdminUserName = null; 
  }

  next();
});


app.set('view engine','ejs');
app.set('views', './src/views');
app.use(express.urlencoded({ extended: false }));
app.use(express.json())
app.use(express.static(path.join(__dirname,'public')));
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    next();
  });
app.use('/images',express.static(path.join(__dirname,'images')));
app.use('/admin',adminRouter);
app.use(clientRouter);

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization");
  next();
});
const startApp = async () => {
    try {
        await connectDb();
        app.listen(3000, () => {
            console.log('Server is running on port 3000');
        });
    } catch (error) {
        console.log('Failed to start the server:', error);
    }
};

startApp();

