const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const bcrypt = require("bcryptjs");
const User = require("./Models/User");
const Company = require("./Models/Company");
const auth = require("./Middleware/Auth");
var jwt = require('jsonwebtoken');
const Product = require("./Models/Product");

app.use(cors());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 100000000 }));
let port = process.env.PORT || 5000;
const url = "mongodb+srv://melihnode:meliherpek1@cluster0.g1oel.mongodb.net/Etecube?&w=majority";
mongoose.set('strictQuery', true);
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
},
    (err) => { if (err) { throw err } console.log("Mongoose ile bağlantı kuruldu.") })

app.post("/login", async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
        res.status(400);
        res.json({ ErrorType: 'Field', ErrorMessage: 'All blanks must be filled.' })


    }
    else {
        const user = await User.findOne({ Username: username })
        if (user === null) {
            res.status(400);
            res.json({ ErrorType: 'Field', ErrorMessage: 'Please enter a valid username, password' })
        }
        else {

            const isMatch = await bcrypt.compare(password, user.Password);
            if (!isMatch) {
                res.status(400);
                res.json({ ErrorType: 'Field', ErrorMessage: 'Please enter a valid password' })
            }
            else {
                const token = jwt.sign({ id: user._id }, 'melih');
                res.json({ success: true, user: user, token: token });
            }
        }

    }
})

app.post("/register", async (req, res) => {
    const { mail, username, password } = req.body;
    if (!mail || !username || !password) {
        res.status(400);
        res.json({ ErrorType: 'Field', ErrorMessage: 'Please enter a valid email, username, password' })
    }
    else {
        const salt = await bcrypt.genSalt();
        const passwordHash = await bcrypt.hash(password, salt);
        const user = await User.findOne({ Email: mail })
        if (user) {
            const userName = await User.findOne({ Username: username })
            if (userName) {
                res.status(400);
                res.json([{ ErrorType: 'Email', ErrorMessage: 'Email already taken.' }, { ErrorType: 'Username', ErrorMessage: 'The username is already taken.' }])
            }
            else {
                res.status(400);
                res.json({ ErrorType: 'Email', ErrorMessage: 'Email already taken.' })
            }

        }
        else {
            const userName = await User.findOne({ Username: username })
            if (userName) {
                res.status(400);
                res.json({ ErrorType: 'Username', ErrorMessage: 'The username is already taken.' })
            }
            else {
                await User.create({
                    Email: mail,
                    Username: username,
                    Password: passwordHash
                })
                const user = await User.findOne({ Username: username });
                res.json({ success: true, id: user._id });
            }
        }
    }
})
app.post("/companyadd", async (req, res) => {
    const { companyName, companyLegalNumber, incorporationCountry, webSite } = req.body;
    if (!companyName || !companyLegalNumber || !incorporationCountry || !webSite) {
        res.status(400);
        res.json({ ErrorType: 'Field', ErrorMessage: 'All blanks must be filled.' })
    }
    else {
        const company = await Company.findOne({ CompanyName: companyName })
        if (company) {
            res.status(400);
            res.json({ ErrorType: 'CompanyExist', ErrorMessage: 'This company already added.' })
        }
        else {

            await Company.create({
                CompanyName: companyName,
                CompanyLegalNumber: companyLegalNumber,
                IncorporationCountry: incorporationCountry,
                WebSite: webSite
            })
            res.json({ success: true });

        }
    }
})
app.post("/productadd", async (req, res) => {
    const { productName, productCategory, productAmount, amountUnit, company } = req.body;
    if (!productName || !productCategory || !productAmount || !amountUnit || !company) {
        res.status(400);
        res.json({ ErrorType: 'Field', ErrorMessage: 'All blanks must be filled.' })
    }
    else {
        const companyC = await Company.findOne({ CompanyName: company })
        if (companyC) {
            await Product.create({
                ProductName: productName,
                ProductCategory: productCategory,
                ProductAmount: productAmount,
                AmountUnit: amountUnit,
                Company: company,
            })
            res.json({ success: true });
        }
        else {
            res.status(400);
            res.json({ ErrorType: 'CompanyExist', ErrorMessage: 'This company doesnt exist.' })
        }
    }
})
app.get("/companys", async (req, res) => {
    const companys = await Company.find();
    res.json(companys);

})
app.get("/products", async (req, res) => {
    const products = await Product.find();
    res.json(products);

})
app.post("/findcompany", async (req, res) => {
    const { companyname } = req.body;
    const company = await Company.findOne({ CompanyName: companyname });

    if (company) {
        res.json(company);
    }
    else {
        res.status(400);
        res.json({ ErrorType: 'CompanyDontExist', ErrorMessage: 'There is no company with that name.' })


    }

})
app.post("/findproduct", async (req, res) => {
    const { productname } = req.body;
    const product = await Product.findOne({ ProductName: productname });

    if (product) {
        res.json(product);
    }
    else {
        res.status(400);
        res.json({ ErrorType: 'CompanyDontExist', ErrorMessage: 'There is no product with that name.' })


    }

})
app.post("/companyupdate", async (req, res) => {
    const { pCompanyname, companyName, companyLegalNumber, incorporationCountry, webSite } = req.body;
    if (!companyName || !companyLegalNumber || !incorporationCountry || !webSite) {
        res.status(400);
        res.json({ ErrorType: 'Field', ErrorMessage: 'All blanks must be filled.' })
    }
    const company = await Company.findOne({ CompanyName: companyName });

    if (company) {
        if (pCompanyname === companyName) {
            await Company.findByIdAndUpdate(company._id, {
                CompanyName: companyName,
                CompanyLegalNumber: companyLegalNumber,
                IncorporationCountry: incorporationCountry,
                WebSite: webSite,
            });
            res.json({ success: true });
        }
        else {
            res.status(400);
            res.json({ ErrorType: 'CompanyDontExist', ErrorMessage: 'There is a company with that name.' })
        }


    }
    else {
        await Company.findByIdAndUpdate(company._id, {
            CompanyName: companyName,
            CompanyLegalNumber: companyLegalNumber,
            IncorporationCountry: incorporationCountry,
            WebSite: webSite,
        });
        res.json({ success: true });
    }

})
app.post("/productupdate", async (req, res) => {
    const { pProductName, productName, productCategory, productAmount, amountUnit, company } = req.body;
    if (!productName || !productCategory || !productAmount || !amountUnit || !company) {
        res.status(400);
        res.json({ ErrorType: 'Field', ErrorMessage: 'All blanks must be filled.' })
    }
    const companyC = await Company.findOne({ CompanyName: company });
    const productC = await Product.findOne({ ProductName: productName });
    if (companyC) {
        {
            const product = await Product.findOne({ ProductName: productName });
            if (product) {
                if (pProductName === productName) {
                    await Product.findByIdAndUpdate(productC._id, {
                        ProductName: productName,
                        ProductCategory: productCategory,
                        ProductAmount: productAmount,
                        AmountUnit: amountUnit,
                        Company: company,
                    });
                    res.json({ success: true });
                }
                else {
                    res.status(400);
                    res.json({ ErrorType: 'ProductExist', ErrorMessage: 'There is a product with that name.' })
                }

            }
            else {
                const product2 = await Product.findOne({ ProductName: pProductName });
                await Product.findByIdAndUpdate(product2._id, {
                    ProductName: productName,
                    ProductCategory: productCategory,
                    ProductAmount: productAmount,
                    AmountUnit: amountUnit,
                    Company: company,
                });
                res.json({ success: true });
            }

        }

    }
    else {
        res.status(400);
        res.json({ ErrorType: 'CompanyDontExist', ErrorMessage: 'There is not a company with that name.' })
    }

})
app.post("/companyremove", async (req, res) => {
    const { pCompanyname } = req.body;

    await Company.findOneAndRemove({ CompanyName: pCompanyname });


    res.json({ success: true });

})
app.post("/productremove", async (req, res) => {
    const { productname } = req.body;

    await Product.findOneAndRemove({ ProductName: productname });


    res.json({ success: true });

})

app.post("/loggedIn", async (req, res) => {
    try {
        const token = req.header("x-auth-token");

        if (!token) return res.json(false);

        jwt.verify(token, "melih");

        res.send(true);
    } catch (err) {
        res.json(false);
    }
})

app.get("/log", auth, async (req, res) => {

    const user = await User.findById(req.user);



    res.json({
        Id: user._id,
        EMail: user.EMail,
    })
});


app.listen(port);