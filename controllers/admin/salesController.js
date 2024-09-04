const user = require('../../models/userdbModel');
const bcrypt = require('bcrypt');
const Order = require("../../models/orderdbSchema");
const Category = require("../../models/categorydbModel");

// sales report load
const salesReportLoad = async (req, res) => {

    try {

        const orderData = await Order.find({}).sort({ date: -1 }).populate({
            path: 'products.productId',
            populate: {
                path: 'offer',
                model: 'Offer'
            }
        });
        
        // total order amount
        let totalOrderAmount = 0;
        let grandTotal = 0;
        let couponTotal = 0;
        let offerTotal = 0;
        orderData.forEach(order => {
            order.products.forEach(product => {
                const anyDelivered = order.products.some(product => product.status === 'Order Delivered');
                if (anyDelivered) {
                    totalOrderAmount += order.totalAmount;
                    grandTotal += product.totalPrice; 
                    couponTotal += order.couponDiscount;
                    if(product.productId.offer && product.productId.offer.status === true){
                        const offer = product.productId.offer.offerPercentage;
                        const productPrice = product.productId.prdctPrice * product.quantity;
                        const offerPrice = (productPrice * offer)/100;
                        offerTotal+=offerPrice;       
                    }
                }
            })
        });       

        // total order count
        const orderCount = orderData.length;

        // total product count
        let productCount = 0;
        orderData.forEach(order =>
            productCount+= order.products.length
        )

        const categoryData = await Category.find({is_listed: true});
        const categoryCount = categoryData.length;

        res.render('admin/salesReport', {
            orderData, 
            totalOrderAmount, 
            orderCount, 
            productCount, 
            categoryCount, 
            grandTotal,
            couponTotal,
            offerTotal
        });

    } catch (error) {
        res.render('admin/404error');
    }

}




const generateSalesReport = async (req, res) => {

    try {
        

        const reportType = req.body.reportType;
        let startDate, endDate;

        switch(reportType){

            case 'daily': 
                        startDate = new Date();
                        startDate.setDate(startDate.getDate() - 1); 
                        endDate = new Date(startDate); 
                        endDate.setDate(endDate.getDate() + 1); 
                        break;
            

            case 'weekly':
                        startDate = new Date();
                        startDate.setDate(startDate.getDate() - 8);
                        endDate = new Date();
                        endDate.setDate(endDate.getDate() + 1);
                        break;
            
            case 'monthly':
                        startDate = new Date();
                        startDate.setDate(startDate.getMonth() - 1);
                        endDate = new Date();
                        endDate.setDate(endDate.getDate() + 1);
                        break;

            case 'yearly':
                        const currentDate = new Date();
                        const currentYear = currentDate.getFullYear();
                        const previousYearStartDate = new Date(currentYear - 1, currentDate.getMonth(), currentDate.getDate());
                        const currentYearStartDate = new Date(currentYear, currentDate.getMonth(), currentDate.getDate());
                        startDate = previousYearStartDate;
                        startDate.setDate(startDate.getDate() + 1); 
                        endDate = currentYearStartDate;
                        endDate.setDate(endDate.getDate() + 1);  
                        break;           

            case 'custom':
                        startDate = new Date(req.body.startDate);
                        startDate.setDate(startDate.getDate() - 1); 
                        endDate = new Date(req.body.endDate);
                        endDate.setDate(endDate.getDate() + 1);
                        break;
            default:
                    return res.json({ success: false, message: 'Invalid report type' });

        }

        const query = {
            date: { $gte: startDate, $lte: endDate }
        };
        
        const orderData = await Order.find(query);

        res.json({ success: true, orderData });

    } catch (error) {
        res.render('admin/404error');
    }

}



module.exports = {
    salesReportLoad,
    generateSalesReport
}