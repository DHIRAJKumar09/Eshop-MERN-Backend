const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name:String,
    price:String,
    category:String,
    company:String
});
module.exports  = mongoose.model("products",productSchema);