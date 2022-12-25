var mongoose = require('mongoose')
const Schema = mongoose.Schema
const productSchema = new Schema({
    ProductName: {
        type: String
    },
    ProductCategory: {
        type: String
    },
    ProductAmount: {
        type: String
    },
    AmountUnit: {
        type: String
    },
    Company: {
        type: String
    },
})
const Product = mongoose.model('Product', productSchema)

module.exports = Product;