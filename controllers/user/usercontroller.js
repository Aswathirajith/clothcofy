const user= require('../../models/userdbModel');
const bcrypt = require('bcrypt');
const otpController = require("../../auth/otpMailVerify");
const Product = require('../../models/productdbModel');
const Cart = require('../../models/cartdbModel');

// hashing password
const securePassword = async (password) => {
    try {

        const passwordHash = await bcrypt.hash(password, 10);

        return passwordHash;

    } catch (error) {
        res.render("user/404");
    }
}


const userLoadpage= async (req,res)=>{
    try {
        res.render("user/userLoadPage") 
    } catch (error) {
        res.render('user/404');
    }
}

const userLoginLoad = async (req,res)=>{
    try {
        res.render('user/userLogin')
    } catch (error) {
        res.render('user/404');
    }
}


const userSignupLoad = async (req,res)=>{
    try {
        res.render('user/userSignup');
    } catch (error) {
        res.render('user/404');
    }
}


// user signUp verification
const verifySignup = async (req, res) => {
    try {
        if (/^[a-zA-Z][a-zA-Z\s]*$/.test(req.body.name)) {

            if (/^[a-zA-Z0-9._%+-]+@(?:gmail|yahoo).com$/.test(req.body.email)) {

                if (/^\d{10}$/.test(req.body.mobile)) {

                    const checkAlreadyMail = await user.findOne({ email: req.body.email });

                    if (checkAlreadyMail) {

                        if (checkAlreadyMail.is_verified === 1) {

                            res.render("user/userSignup", { message: "Email already exists.!" });

                        }else{

                            await otpController.sendOtpMail( req.body.email);
                            await otpController.resendOtpMail( req.body.email);
                            req.session.email = req.body.email;
                            req.session.name = checkAlreadyMail.name;

                            res.redirect("/verifyOtp"); 

                        }
                    } else {

                        const secPassword = await securePassword(req.body.password);

                        const users = new user({
                            name: req.body.name,
                            email: req.body.email,
                            mobile: req.body.mobile,
                            password: secPassword,
                            is_verified: 0
                        });

                        const userData = await users.save();

                        if (userData) {

                            await otpController.sendOtpMail(req.body.email);
                          

                            req.session.email = req.body.email;
                            req.session.name = userData.name;

                            req.session.referralCode = req.query.ref;

                            res.redirect("/verifyOtp");

                        } else {
                            res.render("user/userSignup", { message: "Registration failed.!" });
                        }
                    }
                } else {
                    res.render("user/userSignup", { message: "Enter a valid mobile number.!" });
                }
            } else {
                res.render("user/userSignup", { message: "Enter a valid email.!" });

            }
        } else {
            res.render("user/userSignup", { message: "Enter a valid name.!" });

        }
    } catch (error) {
        res.render('user/404');
    }
}


// verify login
const verifyLogin = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        
        const userData = await user.findOne({ email: email });

        if (userData ) {
            if(userData.is_blocked === false){
            const passwordMatch = await bcrypt.compare(password, userData.password)

            if (passwordMatch) {
                if (userData.is_verified === 0) {

                    res.render("user/userLogin", { message: "Your account is not verified..!" });

                } else {
                    
                    req.session.user_id = userData._id;
                    res.redirect("/userHome");
                }

            } else {
                res.render("user/userLogin", { message: "Please check your password" });
            }
        }else{
            res.render("user/userLogin", {message: "Access Restricted"});
        }
        } else {
            res.render("user/userLogin", { message: "Incorrect mail and passeword" });
        }
    } catch (error) {
        res.render("user/404");
    }
}





// home load
const userHomeLoad = async (req, res) => {
    try {

        const productData = await Product.find({})
                            .populate([
                                { path: 'categoryId' },
                                { path: 'offer' }
                            ]);
        const sortedProductData = productData.sort((a,b) => b.createdOn - a.createdOn);

        // cart products length
        const cartData = await Cart.find({});        
        const cartLength = cartData && cartData.length > 0 ? cartData[0].products.length : 0;
        
        
        res.render("user/userHome", {
            productData: sortedProductData,
            cartLength: cartLength
        });

    } catch (error) {
        res.render('user/404');
    }
}


const userLogoutload = async (req,res)=>{
    try {

        req.session.destroy();
        res.redirect('/');
        
    } catch (error) {
        console.log(error.message);
        
    }
}


// google authentication success
const successGoogleLogin = async (req, res) =>{
    try {

        const name = req.user.displayName;
        const email = req.user.emails[0].value;
        const googleId = req.user.id
        
        const userData = await user.findOne({email:email});
        if(userData){

            req.session.user_id = userData._id;
            res.redirect("/userHome");

        }else{
            
            const secPassword = await securePassword(googleId);
            
            const users = new user({
                name: name,
                email: email,
                googleId: secPassword,
                is_verified: 1
                
            });

            const newUser = await users.save();
            if(newUser){
                req.session.user_id = newUser._id;
                res.redirect("/userHome");
            }
        }     
        
    } catch (error) {
        res.render("user/404");
    }
}

// google authentication failed
const failureGoogleLogin = async (req, res) =>{
    try {

        res.render("user/userLogin", {message: "Some error occured..!"});
        
    } catch (error) {
        res.render("user/404");
    }
}

//contact us load

const contactUs = async(req,res)=>{
    try {
        res.render("user/contactUs")
    } catch (error) {
        res.render('user/404');
    }
}

module.exports={
    userLoadpage,
    userLoginLoad,
    userSignupLoad,
    verifySignup,
    verifyLogin,
    userHomeLoad,
    userLogoutload,
    successGoogleLogin,
    failureGoogleLogin,
    contactUs
}
