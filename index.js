const express = require('express');
const mongoose = require('mongoose');
const Jwt = require('jsonwebtoken');
const User = require('./DB/User');
const prouducts = require('./DB/Products');
const cors = require('cors');
// Load environment variables from .env file
require('dotenv').config();
const app = express();

app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

const JwtKey = process.env.JWT_SECRET;

// Register endpoint
app.post("/register", async (req, res) => {
    try {
        let user = new User(req.body);
        let result = await user.save();
        result = result.toObject();
        delete result.password;
        if(result){
            Jwt.sign({result}, JwtKey, {expiresIn: '2h'}, (err, token) => {
                if(err){
                    res.send({result: "Something went wrong"});
                }
                else{
                    res.send({result, auth: token});
                }
            });
        } else {
            res.send({result: "No user found"});
        }
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(500).send({error: "Internal server error"});
    }
});

// Login endpoint
app.post("/login", async (req, res) => {
    if(req.body.email && req.body.password){
        let user = await User.findOne(req.body).select("-password");
        if(user){
            Jwt.sign({user}, JwtKey, {expiresIn: '2h'}, (err, token) => {
                if(err){
                    res.send({result: "Something went wrong"});
                }
                else{
                    res.send({user, auth: token});
                }
            });
        } else {
            res.send({result: "No user found"});
        }
    } else {
        res.send({result: "No user found"});
    }
});

// Add product endpoint
app.post("/add", verifyToken, async (req, res) => {
    let product = new prouducts(req.body);
    let result = await product.save();
    res.send(result);
});

// Products list endpoint
app.get("/productslist", verifyToken, async (req, res) => {
    let product = await prouducts.find();
    if(product.length > 0){
        res.send(product);
    } else {
        res.send({result: "No results found"});
    }
});

// Delete product endpoint
app.delete("/product/:id", verifyToken, async (req, res) => {
    let result = await prouducts.deleteOne({ _id: req.params.id });
    res.send(result);
});

// Get product by ID endpoint
app.get("/product/:id", verifyToken, async (req, res) => {
    let result = await prouducts.findOne({ _id: req.params.id });
    res.send(result);
});

// Update product by ID endpoint
app.put("/product/:id", verifyToken, async (req, res) => {
    let result = await prouducts.updateOne({ _id: req.params.id }, { $set: req.body });
    res.send(result);
});

// Search products endpoint
app.get("/search/:key", verifyToken, async (req, res) => {
    let result = await prouducts.find({
        "$or":[
            { name: { $regex: req.params.key } },
            { category: { $regex: req.params.key } },
            { company: { $regex: req.params.key } }
        ]
    });
    res.send(result);
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
    let token = req.headers['authorization'];
    if(token){
        token = token.split(' ')[1];
        Jwt.verify(token, JwtKey, (err, valid) => {
            if(err){
                res.send({ result: "Please provide valid token" });
            } else {
                next();
            }
        });
    } else {
        res.send({ result: "Please add token with header" });
    }
}

// Export the Express app
module.exports = app;

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});


//////////////////////////////////////////////////////////////////////////

// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors')
// const Jwt = require('jsonwebtoken');
// const JwtKey = 'e-comm';




// const app = express();
// app.use(express.json());
// app.use(cors());
// require('./DB/config');
// const User = require('./DB/User');
// const prouducts = require('./DB/Products');



// mongoose.connect("mongodb://127.0.0.1:27017/E-commerce");

// const userSchema = new mongoose.Schema({
//     name: String,
//     email: String,
//     password: String
// });

// const User = mongoose.model('products', userSchema); // Corrected model name to 'User'

// app.post("/register", async (req, res) => {
//     try {
//         let user = new User(req.body);
//         let result = await user.save();
//         result = result.toObject();
//         delete result.password;
//         if(result){
//             Jwt.sign({result},JwtKey,{expiresIn:'2h'},(err,token)=>{
//                 if(err){
//                     res.send({result:"soemthing went wrong"});
//                 }
//                 else{
//                     res.send({result,auth:token});
//                 }
//             });
//            }else{
//             res.send({result:"No user found"});
//            }
//     } catch (error) {
//         console.error('Error registering user:', error);
      
//     }
// });

// app.post("/login",async(req,res)=>{
//     if(req.body.email && req.body.password){
//         let user = await User.findOne(req.body).select("-password");
//    if(user){
//     Jwt.sign({user},JwtKey,{expiresIn:'2h'},(err,token)=>{
//         if(err){
//             res.send({result:"soemthing went wrong"});
//         }
//         else{
//             res.send({user,auth:token});
//         }
//     });
//    }else{
//     res.send({result:"No user found"});
//    }
//     }
//     else{
//         res.send({result:"No user found"});
//     }
// });

// app.post("/add",verifyToken,async(req,res)=>{
//     let product = new prouducts(req.body);
//     let result = await product.save();
//     res.send(result);
// });
// app.get("/productslist",verifyToken,async(req,res)=>{
//     let  product = await prouducts.find();
   
//     if(product.length>0){
//         res.send(product);
//     }else{
//         res.send({result:"no result found"});
//     }
   

// });
// app.delete("/product/:id",verifyToken,async(req,res)=>{
//    let result = await prouducts.deleteOne({_id:req.params.id});
//    res.send(result);
// });
// app.get("/product/:id",verifyToken,async(req,res)=>{
//     let result = await prouducts.findOne({_id:req.params.id});
//     res.send(result);
// });
// app.put("/product/:id",verifyToken,async(req,res)=>{
//     let result = await prouducts.updateOne({_id:req.params.id},{$set:req.body});
//     res.send(result);
// });
// app.get("/search/:key",verifyToken,async(req,res)=>{
//     let result = await prouducts.find({
//         "$or":[
//             {name:{$regex:req.params.key}},
//             {category:{$regex:req.params.key}},
//             {company:{$regex:req.params.key}}
//         ]
//     });
//     res.send(result);
// });

// function verifyToken(req,res,next){
//     let token = req.headers['authorization'];
//    if(token){
//     token = token.split(' ')[1];
//     Jwt.verify(token,JwtKey,(err,valid)=>{
//         if(err){
//             res.send({result:"pelase provide valid token"});
//         }else{
//             next();
//         }
//     })
//    }else{
//     res.send({result:"please add token with header"})
//    }
// }

// app.listen(5000, () => {
//     console.log('Server is running on port 5000');
// });
