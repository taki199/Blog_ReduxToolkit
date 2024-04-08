const express = require('express')
const connectToDb = require('./config/connectToDb')
require("dotenv").config();

//connect to DB
connectToDb();

// init app 
const app = express()

//Middlewares

app.use(express.json());

//routes

app.use("/api/auth",require("./routes/authRoute"))


//runing the app 

const Port = process.env.PORT || 8000

app.listen(Port, () => {
    console.log(`Server is running in ${process.env.NODE_ENV} on port ${Port}`)
})