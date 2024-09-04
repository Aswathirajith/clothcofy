const user = require('../../models/userdbModel');


//customer list load
const coustomerListLoad = async (req,res)=>{
    try {

        const page = parseInt(req.query.page) || 1; 
        const pageSize = 4; 
        const skip = (page - 1) * pageSize;

        const totalOrders = await user.countDocuments();
        const totalPages = Math.ceil(totalOrders / pageSize);

        const userData = await user.find({})
        .sort({ name: 1 })
        .skip(skip)
        .limit(pageSize);

        res.render('admin/customerList',{userData,totalPages, currentPage: page });
        
    } catch (error) {
        res.render('admin/404error');
    }
}


//customer block
const BlockUser = async (req,res)=>{
    try {
        const userId = req.params.userId;
     

        await user.findByIdAndUpdate(userId,{is_blocked:true})
        res.redirect('/admin/customerList');

    } catch (error) {
        res.render('admin/404error');
    }
}

const UnBlockUser = async (req,res)=>{
    try {
        const userId = req.params.userId;
        await user.findByIdAndUpdate(userId,{is_blocked:false});
        res.redirect('/admin/customerList');
        
    } catch (error) {
        res.render('admin/404error');
    }
}


module.exports ={
    coustomerListLoad,
    BlockUser,
    UnBlockUser
}