require("dotenv").config();
const express = require('express');
const app = express();
const PORT = process.env.PORT || 4000;
const dbConnection= require('./config/dbconnect');
const session = require("express-session");
const userRoute= require('./routes/userRoutes');
const adminRoute= require('./routes/adminRoutes');
const path= require('path');

const bodyParser = require('body-parser');
app.use(bodyParser.json());


const nocache = require('nocache');
dbConnection();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(nocache());

app.use(
    session({
      secret: process.env.SESSIONSECRET,
      resave: false,
      saveUninitialized: true,
    })
  );

  app.use(express.static(path.join(__dirname,'public')))
app.use(express.static(path.join(__dirname,'uploads')))

app.set("view engine", "ejs");
app.set("views", "./views");


app.use('/',userRoute);
app.use('/admin',adminRoute);



app.listen(PORT,()=>{
    console.log(`server started in port ${PORT}`);
})