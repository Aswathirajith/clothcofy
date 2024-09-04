const Product = require('../../models/productdbModel');
const Cart = require('../../models/cartdbModel');
const Coupon = require('../../models/coupondbModel');

const couponLoad = async(req,res)=>{
    try {
        
        const page = parseInt(req.query.page) || 1; 
        const pageSize = 4; 
        const skip = (page - 1) * pageSize;

        const totalOrders = await Coupon.countDocuments();
        const totalPages = Math.ceil(totalOrders / pageSize);



        const couponData = await Coupon.find({})
        .sort({ date: -1 })
        .skip(skip)
        .limit(pageSize);
        res.render("admin/coupons",{couponData:couponData, totalPages, currentPage: page});
    } catch (error) {
        console.log(error);
    }
}

const addCouponLoad = async(req,res)=>{
    try {
        res.render('admin/addCoupon');
    } catch (error) {
        console.log(error);
    }
}


// add coupon
const addCoupons = async (req, res) =>{

    try {
        
        const name = req.body.couponName;
        const description = req.body.couponDescription;
        const code = req.body.couponCode;
        const validity = new Date(req.body.couponValidity);
        const currentDate = new Date();
        const minimumAmount = req.body.minimumPurchaseAmount;
        const discount = req.body.couponDiscount;

        if(!name || /^\s*$/.test(name)){
            return res.render("admin/addCoupon", {message: "Enter a valid coupon name"});
        }

        if(!description || /^\s*$/.test(description)){
            return res.render("admin/addCoupon", {message: "Enter a valid coupon description"});
        }

        if(!code || /^\s*$/.test(code)){
            return res.render("admin/addCoupon", {message: "Enter a valid coupon code"});
        }

        if(!validity || validity < currentDate){
            return res.render("admin/addCoupon", {message: "Enter a valid date"});
        }

        if(!minimumAmount || minimumAmount <= 0){
            return res.render("admin/addCoupon", {message: "Minimum purchase amount should not be zero!"});
        }
        
        if(!discount || discount <= 0 || discount >= 4000){
            return res.render("admin/addCoupon", {message: "You have reached minimum/maximum discount limit!"});
        }

        const newCoupon = new Coupon({
            name: name,
            description: description,
            code: code,
            validity: validity,
            minimumAmount: minimumAmount,
            discount: discount
        });

        await newCoupon.save();

        res.redirect("admin/coupons");

    } catch (error) {
        console.log(error);
    }

}


const deleteCoupon = async(req,res)=>{
    try {

        const couponId = req.query.couponId;

        const couponData = await Coupon.findOne({_id:couponId});

        if(!couponData)
        {
            return res.json({message:"no coupon found"});
        }

        await Coupon.deleteOne({_id:couponId});
        res.json({message:"coupon deleted successfully"});

       
        
    } catch (error) {
        console.log(error);
    }
}




module.exports={
    couponLoad,
    addCouponLoad,
    addCoupons,
    deleteCoupon
}