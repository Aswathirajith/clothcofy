require('dotenv').config();
const user = require('../models/userdbModel');
const otpmodel = require('../models/otpdbModel');
const nodemailer = require('nodemailer');



function generateotp()
{
    let digits = "1234567890";  
    let otp = "";
    
    for(let i=0; i<6; i++){

        otp += digits[Math.floor(Math.random()*10)];
        
    }
    return otp;

}


// for sending mail
const sendOtpMail = async (email) =>{

    try {
       
        const otp = generateotp();
        const createdAt = new Date();
        const expiredAt = new Date(Date.now() + (1 * 60 * 1000));
        await otpmodel.deleteOne({email:email});
               
        const otpData = new otpmodel({
            email: email,
            otp: otp,
            createdAt: createdAt,
            expiredAt: expiredAt
        });
        await otpData.save();
        
        const transporter = await nodemailer.createTransport({
        
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth:{
                user: process.env.AUTHENTICATION_EMAIL,
                pass: process.env.AUTHENTICATION_PASS
            }
        });

        const mailOptions = {
            from: "aswathirajith02@gmail.com",
            to: email,
            subject: "clothyfy Ecom signup verification OTP",
            text: `Hi, 

            Please verify your Elaine Ecom account using OTP.

            Your OTP for verification : ${otp}.`
        }

        transporter.sendMail(mailOptions, (error,info) =>{
            if(error){
                console.log(error);
            }else{
                console.log(otp);
                console.log("Email has been sent:-"+info.response);
            }
        });

    } catch (error) {
        console.log(error);
    }
}

// load otp page 
const verifyOtpLoad = async (req, res) =>{
    try {

        res.render("user/verifyOtp");

    } catch (error) {
        console.log(error.message);
    }
}

// otp verification
const verifyOtp = async (req, res) =>{
    
    try {
        
        const {otp1,otp2,otp3,otp4,otp5,otp6} = req.body;

        const otpNo = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`;
        
        
        const otpData = await otpmodel.findOne({email: req.session.email});

        if(otpData && otpData.otp === parseInt(otpNo)){

            await user.updateOne({email:req.session.email},{is_verified: 1});
         
            res.render("user/userLogin");

        }else{
            res.render("user/verifyOtp", {message: "Invalid Otp"});
        }

    } catch (error) {

        console.log(error);
        res.render("user/verifyOtp",{ message: "An error occured"});   
           
    }
}



// resend otp
const resendOtpLoad = async (req, res) =>{
    try {
        
        await resendOtpMail(req.session.email );
        res.render("user/verifyOtp");
      
    } catch (error) {
        console.log(error.message);
    }
}



// resend otp mail
const resendOtpMail = async (email) =>{

    try {
       
        const otp = generateotp();
        const createdAt = new Date();
        const expiredAt = new Date(Date.now() + (1 * 60 * 1000));

        await otpmodel.deleteOne({email:email});
               
        const otpData = new otpmodel({
            email: email,
            otp: otp,
            createdAt: createdAt,
            expiredAt: expiredAt
        });
        await otpData.save();
        
        const transporter = await nodemailer.createTransport({
        
            host: "smtp.gmail.com",
            port: 587,
            secure: false,
            requireTLS: true,
            auth:{
                user: process.env.AUTHENTICATION_EMAIL,
                pass: process.env.AUTHENTICATION_PASS
            }
        });

        const mailOptions = {
            from: "aswathirajith02@gmail.com",
            to: email,
            subject: "clothyfy Ecom signup verification OTP",
            text: `Hi, 

            Please verify your Elaine Ecom account using OTP.

            Your OTP for verification : ${otp}.`
        }

        transporter.sendMail(mailOptions, (error,info) =>{
            if(error){
                console.log(error);
            }else{
                console.log("Email has been sent:-"+info.response);
                console.log(otp);
            }
        });

    } catch (error) {
        console.log(error.message);
    }
}


// verify resend OTP
const verifyResendOtp = async (req, res) => {

    try {
        
        const {otp1,otp2,otp3,otp4,otp5,otp6} = req.body;

        const otpNo = `${otp1}${otp2}${otp3}${otp4}${otp5}${otp6}`
        
        const otpData = await otpmodel.findOne({email: req.session.email});

        if(otpData && otpData.otp === parseInt(otpNo)){

            await user.updateOne({email:req.session.email},{is_verified: 1});
            
            res.render("user/userLogin");

        }else{
            res.render("user/verifyOtp", {message: "Invalid Otp"});
        }

    } catch (error) {

        console.log(error);
        res.render("user/verifyOtp",{message: "An error occured"});   
           
    }

}




module.exports={
    verifyOtpLoad,
    verifyOtp,
    sendOtpMail,
    resendOtpMail,
    resendOtpLoad,
    verifyResendOtp     
}