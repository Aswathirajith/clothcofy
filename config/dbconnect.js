const mongoose = require('mongoose');


// Connect to MongoDB
const dbConnection = () =>{
    try {
        const connect = mongoose.connect(process.env.MONGODB_URL)
        console.log('Connected to MongoDB');
    }catch(err){
        console.error('MongoDB   connection error:', err);
}
}
module.exports=dbConnection
