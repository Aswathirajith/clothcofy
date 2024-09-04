require("dotenv").config();
const express = require("express");
const user_route = express.Router();
const session = require('express-session');
const passport = require('passport');
require('../auth/passport');
const multer = require('multer');
const upload = multer();



// passport google authentication
user_route.use(passport.initialize());
user_route.use(passport.session());

//controllers
const otpcontroller = require('../auth/otpMailVerify');
const usercontroller=require('../controllers/user/usercontroller');
const productController = require('../controllers/user/productcontroller');
const Cartcontroller  = require('../controllers/user/cartController');
const myAccountController = require('../controllers/user/accountController');
const forgotPassController = require('../auth/forgotPassword');
const orderController = require('../controllers/user/orderController');
const wishlistController = require("../controllers/user/wishlistController");




//authentication midileware
const authentication = require('../middlewares/userAuthentication');
const accessAuth = require('../middlewares/accessAuthentication');



// session
user_route.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
}));


//user load page route
user_route.get('/',authentication.isLogout,usercontroller.userLoadpage);

//user load login page
user_route.get('/userlogin',authentication.isLogout,usercontroller.userLoginLoad);
user_route.post('/userlogin',usercontroller.verifyLogin);

// google authentication
user_route.get("/google",authentication.isLogout, passport.authenticate("google", {
    scope: ["email", "profile"]
}));

// google authentication callback
user_route.get("/auth/google/callback", authentication.isLogout, passport.authenticate("google", {
    successRedirect: "/success",
    failureRedirect: "/failure"
}));


// user google authentication routes
user_route.get("/success", authentication.isLogout, usercontroller.successGoogleLogin);
user_route.get("/failure", authentication.isLogin, usercontroller.failureGoogleLogin);

//user sign up page load
user_route.get('/userSignup',authentication.isLogout,usercontroller.userSignupLoad);
user_route.post('/userSignup',usercontroller.verifySignup);
user_route.get('/userHome',authentication.isLogin,accessAuth.accessUser,usercontroller.userHomeLoad);

//product route
user_route.get('/products',authentication.isLogin,accessAuth.accessUser,productController.allProductsListLoad);
user_route.get("/productDetails",authentication.isLogin,accessAuth.accessUser,productController.productDetailsLoad);
user_route.post('/sortingProducts',productController.sortProducts);
user_route.post('/filterProducts',productController.filterProducts);

//cart route
user_route.get('/cart',authentication.isLogin,accessAuth.accessUser,Cartcontroller.cartLoad);
user_route.get('/addProductsToCart',authentication.isLogin,accessAuth.accessUser,Cartcontroller.addProductsToCart);
user_route.post("/updateCartItemQuantity/:productId", Cartcontroller.updateCartQuantity);
user_route.delete("/deleteCartItem/:productId",Cartcontroller.deleteCartItem);

//otp route
user_route.get('/verifyotp',authentication.isLogout,otpcontroller.verifyOtpLoad);
user_route.post('/verifyotp',otpcontroller.verifyOtp)
user_route.get('/resendotp',authentication.isLogout,otpcontroller.resendOtpLoad);
user_route.post('/resendotp',otpcontroller.verifyResendOtp);

//myaccount route
user_route.get("/myAccount",authentication.isLogin,accessAuth.accessUser,myAccountController.myAccountLaod);
user_route.post("/saveAddress",myAccountController.saveAddress);
user_route.put('/editAddress/:id',authentication.isLogin,myAccountController.editAddress);
user_route.delete("/removeAddress",authentication.isLogin,accessAuth.accessUser,myAccountController.removeAddress);
user_route.put("/userProfile",authentication.isLogin,accessAuth.accessUser,myAccountController.editUserProfile);
user_route.put('/changePassword',authentication.isLogin,accessAuth.accessUser, upload.none(),myAccountController.changePassword);

//forgot password route
user_route.get('/forgotPasswordEmail',authentication.isLogout,forgotPassController.forgotPasswordEmailLoad);
user_route.post('/forgotPasswordEmail',forgotPassController.verifyForgotEmail);
user_route.get('/verifyOtpForgot',authentication.isLogout,forgotPassController.verifyOtpForgotLoad);
user_route.post('/verifyOtpForgot',forgotPassController.verifyOtpForgot);
user_route.get("/forgotPassword", authentication.isLogout, forgotPassController.forgotPasswordLoad);
user_route.post("/forgotPassword", forgotPassController.updatePassword);

//order route
user_route.get("/checkout",authentication.isLogin,accessAuth.accessUser,orderController.checkoutLoad);
user_route.post("/placeOrder",orderController.placeOrder);
user_route.get("/orderHistory",authentication.isLogin,accessAuth.accessUser,orderController.orderHistoryLoad);
user_route.post("/addCoupon", orderController.addCoupon);
user_route.get("/orderDetails",authentication.isLogin,accessAuth.accessUser,orderController.orderDetailsLoad);
user_route.post("/walletOrder",orderController.createWalletOrder);
user_route.post("/cancelProduct",orderController.cancelProduct);
user_route.post("/returnProduct",orderController.handleReturnProduct);
user_route.post("/razorpayOrder", orderController.createRazorpayOrder);
user_route.post("/verifyPayment", orderController.verifyRazorPayment);
user_route.post("/retryPayment", orderController.retryRazorPayment);
user_route.post("/handleFailedPayment", orderController.failedPayment);
user_route.post("/generateInvoice", orderController.generateInvoice);

//wishlist Route
user_route.get("/wishlist",authentication.isLogin,accessAuth.accessUser,wishlistController.wishlistLoad);
user_route.get("/addToWishlist",authentication.isLogin,accessAuth.accessUser,wishlistController.addToWishlist);
user_route.delete("/removeFromWishlist",authentication.isLogin,accessAuth.accessUser,wishlistController.deleteWishlistItem);


//contact us route
user_route.get("/contactUs",usercontroller.contactUs)

// logout route
user_route.get('/userLogout',authentication.isLogin,usercontroller.userLogoutload);


module.exports=user_route;