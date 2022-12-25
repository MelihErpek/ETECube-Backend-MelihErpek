var mongoose = require('mongoose')
const Schema = mongoose.Schema
const companySchema = new Schema({
    CompanyName: {
        type: String
    },
    CompanyLegalNumber: {
        type: String
    },
    IncorporationCountry: {
        type: String
    },
    WebSite: {
        type: String
    },
})
const Company = mongoose.model('Company', companySchema)

module.exports = Company;