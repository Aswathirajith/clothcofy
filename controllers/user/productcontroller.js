const Product = require("../../models/productdbModel");
const Category = require("../../models/categorydbModel");
const Offer = require("../../models/offerdbModel");



// all product list
const allProductsListLoad = async (req, res) => {
    try {

        var searchWord = '';
        if(req.query.search){
            searchWord = req.query.search;
        }
        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6; 
        const skip = (page - 1) * limit;

        const productsData = await Product.find({
            $or:[
                {prdctName: {$regex: '.*'+searchWord+'.*', $options: 'i' }},
            ]
        }).populate('offer')
        .skip(skip)
        .limit(limit);
        
        const totalCount = await Product.countDocuments({
            $or:[
                {prdctName: {$regex: '.*'+searchWord+'.*', $options: 'i' }},
            ]
        });
        const categoryData = await Category.find({});
        
        const offerData = await Offer.find({});

        if (offerData) {
            for (const offer of offerData) {
                if (offer.type === 'Products') {
                    const offerTypeName = offer.typeName;
                    const matchingProducts = productsData.filter(product => product.prdctName === offerTypeName);
                    for (const matchingProduct of matchingProducts) {
                        const offerId = offer._id;
                        const currentDate = Date.now();
                        if(offer.status === true && offer.validity >= currentDate){
                                await Product.updateOne({ _id: matchingProduct._id }, { offer: offerId });
                        }
                    }
                }
            }
        }

        const remainingProducts = await Product.find({
            $or:[
                {prdctName: {$regex: '.*'+searchWord+'.*', $options: 'i' }},
            ]
        }).skip(skip + limit).limit(1);

        const hasNextPage = remainingProducts.length > 0;
        
              

        res.render("user/products", { 
            productsData: productsData, 
            categoryData: categoryData,
            totalCount: totalCount, 
            currentPage: page, 
            totalPages: Math.ceil(totalCount / limit),
            hasNextPage: hasNextPage,
            
        });

    } catch (error) {
        res.render("user/404");
    }
}


// product details load
const productDetailsLoad = async (req, res) => {

    try {

        const productId = req.query.productId;

        //for getting the product data with the particular id
        const productDatabyId = await Product.findById({ _id: productId })                            
                                            .populate([
                                                { path: 'categoryId' },
                                                { path: 'offer' }
                                            ]);

        // for getting product images only without id 
        const productImagebyId = await Product.findById({ _id: productId },{prdctImage:1, _id:0});

        // for getting the images only as an array
        const productImagesArray = productImagebyId.prdctImage.map(image => `${image}`);

        res.render("user/productDetails", {productDatabyId, productImagebyId, productImagesArray});

    } catch (error) {
        res.render("user/404");
    }

}

const sortProducts = async (req, res) => {
    try {
        const sortOption = req.body.sortby;
        let productsData;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        

        // Determine sorting option
        switch (sortOption) {
            case 'priceLowToHigh':
                productsData = await Product.find({}).sort({ prdctPrice: 1 }).populate('offer').skip(skip).limit(limit);
                break;
            case 'priceHighToLow':
                productsData = await Product.find({}).sort({ prdctPrice: -1 }).populate('offer').skip(skip).limit(limit);
                break;
            case 'newArrivals':
                productsData = await Product.find({}).sort({ createdOn: -1 }).populate('offer').skip(skip).limit(limit);
                break;
            case 'nameAZ':
                productsData = await Product.find({}).sort({ prdctName: 1 }).populate('offer').skip(skip).limit(limit);
                break;
            case 'nameZA':
                productsData = await Product.find({}).sort({ prdctName: -1 }).populate('offer').skip(skip).limit(limit);
                break;
            default:
                return res.json({ success: false, message: 'Invalid sort option' });
        }

        // Total count of products (without limit)
        const totalCount = await Product.countDocuments({});

        // Calculate total pages
        const totalPages = Math.ceil(totalCount / limit);

        // Determine if there are previous or next pages
        const hasNextPage = page < totalPages;
        

        res.json({
            success: true,
            data: productsData,
            totalCount: totalCount,
            currentPage: page,
            totalPages: totalPages,
            hasNextPage: hasNextPage,
            
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'An error occurred while sorting products' });
    }
};




// filter products
const filterProducts = async (req, res) => {
    try {

        let categoryData;
        const selectedCategories = req.body.categories;
        
        if (selectedCategories && selectedCategories.length > 0) {

            categoryData = await Product.find({ categoryId: { $in: selectedCategories } });
            
        } else {

            categoryData = await Product.find();
        }
        
        res.json({ success: true, data: categoryData });
        
    } catch (error) {
        res.render('user/404');
    }
}



//search 

const searchProducts = async (req, res) => {
    try {
        const searchQuery = req.body.searchTerm || '';  // Search term from the client
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

        // Perform search by looking for products that match the search term in the product name or description
        const productsData = await Product.find({
            $or: [
                { prdctName: { $regex: searchQuery, $options: 'i' } },  // case-insensitive search
                { prdctDescription: { $regex: searchQuery, $options: 'i' } }
            ]
        })
        .populate('offer')
        .skip(skip)
        .limit(limit);

        const totalCount = await Product.countDocuments({
            $or: [
                { prdctName: { $regex: searchQuery, $options: 'i' } },
                { prdctDescription: { $regex: searchQuery, $options: 'i' } }
            ]
        });

        res.json({
            success: true,
            data: productsData,
            totalCount: totalCount,
            currentPage: page,
            totalPages: Math.ceil(totalCount / limit),
        });

    } catch (error) {
        console.error(error);
        res.json({ success: false, message: 'An error occurred while searching products' });
    }
};







module.exports = {
    allProductsListLoad,
    productDetailsLoad,
    sortProducts,
    filterProducts,
    searchProducts
    
}