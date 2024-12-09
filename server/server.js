import express from "express"
import mongoose from "mongoose";
const server=express()
import 'dotenv/config'
let PORT=3000;

mongoose.connect(process.env.DB_LOCATION,{ autoIndex:true})

server.post("/signup", (req,res)=>{
    console.log(req.body)
    res.json(req.body)
})

server.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})