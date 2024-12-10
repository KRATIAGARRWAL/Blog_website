import express from "express"
import mongoose from "mongoose";
import 'dotenv/config'
import bcrypt from 'bcryptjs'
const server=express()

let PORT=3000;

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json())

mongoose.connect(process.env.DB_LOCATION,{ autoIndex:true})

server.post("/signup", (req,res)=>{
    let {fullname, email, password}=req.body;
    
    // validating data from frontend
    if(fullname.length<3){
        return res.status(403).json({"error" : "Fullname must be at least 3 letters long"})
    }
    if(!email.length){
        return res.status(403).json({"error":"Enter email"})
    }
    if(!emailRegex.test(email)){
        return res.status(403).json({"error" : "Invalid email"})
    }
    if(!password.length){
        return res.status(403).json({"error":"Enter password"})}
    if(!passwordRegex.test(password)){
        return res.status(403).json({"error" : "Password should be 6 to 20 characters long with a numeric, 1 lowercase and 1 uppercase letter"})
    }

    return res.status(200).json({"status":"okay"})
})

server.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})