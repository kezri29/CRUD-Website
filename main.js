//imports
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 4000 ;

//database connection
mongoose.connect(process.env.DB_URI, {}); //here in the {useNewUrlParser : true, useUnifiedTopology: true} is been romoved because it is not needed for current version of mongodb
const db = mongoose.connection;
db.on('error',(error)=>{
    console.log(error);
})
db.once('open', ()=>{
    console.log('Database connection successful');
})

//middlewares
app.use(express.urlencoded({extended : false}));
app.use(express.json());
app.use(
    session({
        secret : "my secret key",
        saveUninitialized : true,
        resave : false
    })
);
app.use((req,res,next)=>{  //session storage messages
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
})
app.use(express.static('uploads')); //static data

//set template engine
app.set("view engine","ejs");

//routes
app.use("",require("./routes/routes"));

//port
app.listen(PORT, ()=>{
    console.log(`Server running at http://localhost:${PORT}`);
})
