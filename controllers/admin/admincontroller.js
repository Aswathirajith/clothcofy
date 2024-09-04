const User = require("../../models/userdbModel");
const Order = require("../../models/orderdbSchema");
const Category = require("../../models/categorydbModel");
const Product = require("../../models/productdbModel");
const bcrypt = require("bcrypt");


const adminLoad = async (req,res)=>{
    try {
        res.render('admin/adminLogin');
    } catch (error) {
        res.render('admin/404error');
    }
}


const verifyAdminLogin = async (req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({email:email});

        if(userData)
        {
            const passmatch = await bcrypt.compare(password,userData.password);

            if(passmatch)
            {
                if(userData.is_admin===0)
                {
                    res.render('admin/adminLogin',{message:'You are not an admin'})
                }
                else{
                    req.session.admin_id = userData._id;
                    res.redirect('/admin/adminHome');
                }
            }
            else
            {
                res.render('admin/adminLogin',{message:'email and password incorrect'});
            }

        }
        else{
            res.render('admin/adminLogin',{message:'email and password incorrect'});
        }
        


    } catch (error) {
        res.render('admin/404error');
    }
}


//admi dash board
const Loadhome = async (req,res)=>{
    try {

        const orderDataDisplay = await Order.find({}).sort({date: -1}).limit(10);

        const orderData = await Order.find({}).sort({date: -1});

        const monthlySales = new Array(12).fill(0); 
        const yearlySales = new Array(12).fill(0);
        
        // monthly sales & yearly sales
        orderData.forEach(order => {
            const month = order.date.getMonth();
            const totalAmount = order.totalAmount;
            monthlySales[month] += totalAmount;
            yearlySales[month] += totalAmount;
        });

        // total order amount
        let totalOrderAmount = 0;
        orderData.forEach(total => 
            totalOrderAmount += total.totalAmount
        )

        // total order count
        const orderCount = orderData.length;

        // total product count
        let productCount = 0;
        orderData.forEach(order =>
            productCount+= order.products.length
        )

        const category = await Category.find({is_listed: true});
        const categoryCount = category.length;

        const topProducts = await Order.aggregate([
            { $unwind: "$products" },
            { $group: {
                _id: "$products.productId",
                productName: { $first: "$products.productName" },
                totalSold: { $sum: 1 }
            }},
            { $sort: { totalSold: -1 }},
            { $limit: 10 } 
        ]);
        const productData = await Order.populate(topProducts, { path: "_id", model: "Product" });
        const categoryIds = topProducts.map(product => product._id.categoryId);

        const topCategory = await Product.aggregate([
            { $match: { categoryId: { $in: categoryIds } } },
            { $lookup: { 
                from: "categories", 
                localField: "categoryId",
                foreignField: "_id",
                as: "category"
            }},
            { $unwind: "$category" }, 
            { $group: {
                _id: "$categoryId",
                cateName: { $first: "$category.cateName" }, 
                totalSold: { $sum: 1 }
            }},
            { $sort: { totalSold: -1 }},
            { $limit: 10 }
        ]);
        
        res.render('admin/adminHome', {
            orderDataDisplay, 
            totalOrderAmount, 
            orderCount, 
            productCount, 
            categoryCount, 
            topProducts,
            productData,
            topCategory,
            monthlySales,
            yearlySales
        });

    } catch (error) {
        res.render('admin/404error');
    }
}



//admin Logout

const adminLogout = async(req,res)=>{
    try {
        req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        res.render('admin/404error');
    }
}

module.exports ={
    adminLoad,
    verifyAdminLogin,
    Loadhome,
    adminLogout,
    
}