const User = require('../../models/userdbModel');
const Product =require("../../models/productdbModel");
const Cart = require("../../models/cartdbModel");
const bcrypt = require('bcrypt');
const Order = require('../../models/orderdbSchema');

// hashing password
const securePassword = async (password) => {
    try {

        const passwordHash = await bcrypt.hash(password, 10);

        return passwordHash;

    } catch (error) {
        res.render("404");
    }
}

// function to validate strings
const validateString = (str) => /^[a-zA-Z][a-zA-Z\s]*$/.test(str);

// function to validate email
const validateEmail = (email) => /^[a-zA-Z0-9._%+-]+@(?:gmail|yahoo).com$/.test(email);

//  function to validate pincode
const validatePincode = (pincode) => /^\d{6}$/.test(pincode);

//  function to validate phone number
const validatePhone = (phone) => /^\d{10}$/.test(phone);



const myAccountLaod = async(req,res)=>{
    try {
        const userId = req.session.user_id;
        const userData = await User.findById(userId);
        let orderData = await Order.find({ userId })
        .populate('products.productId').sort({date:-1})
        
        res.render('user/myAccount',{userData,orderData});
    } catch (error) {
        console.log(error);
    }
}
// add and save address

const saveAddress = async (req, res) => {
    try {
        const {
            fullname,
            addressline,
            city,
            state,
            email,
            pincode,
            phone
        } = req.body;

        if (!validateString(fullname)) return res.json({ message: "Enter a valid Name" });
        if (!validateString(addressline)) return res.json({ message: "Enter a valid Street Address" });
        if (!validateString(city)) return res.json({ message: "Enter a valid City Name" });
        if (!validateString(state)) return res.json({ message: "Enter a valid State Name" });
        if (!validateEmail(email)) return res.json({ message: "Enter a valid Email" });
        if (!validatePincode(pincode)) return res.json({message:"enter a valid pincode"});
        if (!validatePhone(phone)) return res.json({message:"Enter a valid Mobile Number"});

        await User.findByIdAndUpdate(
            {
                _id: req.session.user_id
            },
            {
                $push: {
                    address: {
                        fullname: fullname,
                        addressline: addressline,
                        city: city,
                        state: state,
                        email: email,
                        pincode: pincode,
                        phone: phone
                    }
                }
            }
        );

        return res.json({ message: 'Address saved successfully' });
        
    } catch (error) {
        res.render("404");
    }
}

// edit address
const editAddress = async (req, res) => {
    try {
        const editAddressId = req.params.id;
        const userId = req.session.user_id;
        
        const {
            fullname,
            addressline, 
            city,
            state,
            email,
            pincode,
            phone    
        } = req.body;

        if (!validateString(fullname)) return res.json({ message: "Enter a valid Name" });
        if (!validateString(addressline)) return res.json({ message: "Enter a valid Street Address" });
        if (!validateString(city)) return res.json({ message: "Enter a valid City Name" });
        if (!validateString(state)) return res.json({ message: "Enter a valid State Name" });
        if (!validateEmail(email)) return res.json({ message: "Enter a valid Email" });
        if (!validatePincode(pincode)) return res.json({message:"enter a valid pincode"});
        if (!validatePhone(phone)) return res.json({message:"Enter a valid Mobile Number"});

        await User.findOneAndUpdate(
            {
                _id: userId,
                "address._id": editAddressId
            },
            {
                $set:{
                    "address.$.fullname": fullname,
                    "address.$.addressline": addressline,
                    "address.$.city": city,
                    "address.$.state": state,
                    "address.$.email": email,
                    "address.$.pincode": pincode,
                    "address.$.phone": phone
                }
            });

            return res.json({ message: 'Address updated successfully' });

    } catch (error) {
        console.log(error);
    }
}

// remove Address
const removeAddress = async (req, res) => {
    try {
        
        const addressId = req.body.addressId;
        
        const userData = await User.findOneAndUpdate(
            {"address._id": addressId},
            {$pull:{address:{_id:addressId}}}
        );

        if (!userData) {
            return res.json({ message: 'User not found' });
        }

        res.json({ message: 'Address removed successfully' });


    } catch (error) {
        console.log(error);
    }

}

// edit user profile
const editUserProfile = async (req, res) => {

    try {
        
        const {name, mobile} = req.body;

       // Validate inputs
       if (!validateString(name)) return res.json({ message: "Enter a valid name" });
       if (!validatePhone(mobile)) return res.json({ message: "Enter a valid mobile number" });


        await User.findByIdAndUpdate(
            {
                _id: req.session.user_id
            },
            {
                $set:{
                    "name": name,
                    "mobile": mobile
                }
            });

        return res.json({message: "Profile details updated successfully.!"});

    } catch (error) {
        res.render("404");
    }

}


// change password
const changePassword = async (req, res) => {

    try {
        
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        //current and new are same
        if(currentPassword === newPassword){
           console.log(currentPassword);
           console.log(newPassword);
            return res.json({ message: "New password cannot be the same as current password." });

        }else{
            if(newPassword === confirmPassword){

                const secPassword = await securePassword(confirmPassword);
                await User.updateOne({_id: req.session.user_id}, {password: secPassword});
                res.json({message: 'Password saved successfully'});

            }else{

                return res.json({ message: "Current or new password is incorrect."});

            }
        }

    } catch (error) {
        res.render("404");
    }

}

module.exports={
    myAccountLaod,
    saveAddress,
    editAddress,
    removeAddress,
    editUserProfile,
    changePassword
}