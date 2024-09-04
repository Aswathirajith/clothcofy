require('dotenv').config();
const express = require('express');
const admin_route = express.Router();
const session = require('express-session');



// session
admin_route.use(session({
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET
}));



//acess controllers

const adminController = require('../controllers/admin/admincontroller');
const authentication = require('../middlewares/adminAuthentication');
const usercontroller = require('../controllers/admin/usercontroller');
const categoryController = require('../controllers/admin/categoryController');
const productController = require('../controllers/admin/productController');
const offerController = require('../controllers/admin/offerController');
const OrderController = require("../controllers/admin/orderController");
const couponController = require("../controllers/admin/couponController");
const salesController = require("../controllers/admin/salesController");



//admi login route
admin_route.get('/',authentication.isAdminLogout,adminController.adminLoad);
admin_route.get('/admin',authentication.isAdminLogout,adminController.adminLoad);
admin_route.post('/',adminController.verifyAdminLogin);

// admin home/dashboard
admin_route.get('/adminHome',authentication.isAdminLogin, adminController.Loadhome);


//coustomer list load
admin_route.get('/customerList',authentication.isAdminLogin,usercontroller.coustomerListLoad);
admin_route.get('/blockUser/:userId',authentication.isAdminLogin,usercontroller.BlockUser);
admin_route.get('/unblockUser/:userId',authentication.isAdminLogin,usercontroller.UnBlockUser);


//category route
admin_route.get('/addCategory',authentication.isAdminLogin,categoryController.categoryLoad);
admin_route.post('/addCategory',categoryController.addCategory);
admin_route.get('/listCategory/:cateId',authentication.isAdminLogin,categoryController.listCategory);
admin_route.get('/unlistCategory/:cateId',authentication.isAdminLogin,categoryController.UnlistCategory);
admin_route.get('/editCategory',authentication.isAdminLogin,categoryController.editCategory);
admin_route.post('/editCategory',authentication.isAdminLogin,categoryController.updateCategory);

//product route
admin_route.get('/productsList',authentication.isAdminLogin,productController.productListLoad);
admin_route.get('/addProduct',authentication.isAdminLogin,productController.addProductLoad);
admin_route.post('/addProduct', productController.uploadOriginal.array("prdctImage", 4),productController.addProduct);
admin_route.get('/listProduct/:prdctId',authentication.isAdminLogin,productController.listProduct);
admin_route.get('/unlistProduct/:prdctId',authentication.isAdminLogin,productController.unlistProduct);
admin_route.get('/editProduct',authentication.isAdminLogin,productController.editProduct);
admin_route.post('/editProduct',productController.updateProduct);
admin_route.delete('/deleteProductImage', authentication.isAdminLogin, productController.deleteProductImage);
admin_route.put('/uploadProductImages', productController.uploadOriginal.array("prdctImage", 4), productController.editProductImages);

//offer route
admin_route.get('/offers',authentication.isAdminLogin,offerController.offerLoad);
admin_route.get('/addOffer',offerController.addOfferLoad);
admin_route.post('/addOffer',offerController.addOffer);
admin_route.patch('/offerStatus/:offerId/:newStatus', authentication.isAdminLogin, offerController.changeOfferStatus);
admin_route.delete('/offer', authentication.isAdminLogin, offerController.deleteOffer);
admin_route.get('/getProducts', authentication.isAdminLogin,offerController.getProducts);
admin_route.get('/getCategories', authentication.isAdminLogin, offerController.getCategories);

//order Route
admin_route.get('/orders',authentication.isAdminLogin,OrderController.ordersLoad);
admin_route.get('/orderDetails',authentication.isAdminLogin,OrderController.orderDetails);
admin_route.post('/shippedStatusChange/:orderId',OrderController.shippedStatusChange);
admin_route.post('/deliveredStatusChange/:orderId',OrderController.deliveredStatusChange);
admin_route.post('/cancelledStatusChange/:orderId', OrderController.cancelledStatusChange);
admin_route.post('/approveReturn',OrderController.approveReturnRequest);

//coupon route
admin_route.get('/coupons',authentication.isAdminLogin,couponController.couponLoad);
admin_route.get('/addCoupon',authentication.isAdminLogin,couponController.addCouponLoad);
admin_route.post('/addCoupon',couponController.addCoupons);
admin_route.delete('/coupon',couponController.deleteCoupon);


//sales route
admin_route.get('/salesReport',salesController.salesReportLoad);
admin_route.post('/salesReport',salesController.generateSalesReport);



//admin logout
admin_route.get('/adminLogout',authentication.isAdminLogin,adminController.adminLogout);


module.exports = admin_route;