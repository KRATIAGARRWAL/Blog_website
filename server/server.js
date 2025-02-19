import express from "express"
import mongoose from "mongoose";
import 'dotenv/config'
import bcrypt from 'bcrypt'
import {nanoid} from 'nanoid';
import jwt from 'jsonwebtoken'
import cors from 'cors';
import admin from "firebase-admin";
import serviceAccountKey from "./blogwebsite-6d75e-firebase-adminsdk-fbsvc-5b83738961.json" assert { type: "json" }
import {getAuth} from "firebase-admin/auth"
import aws from "aws-sdk"


//Schema import
import User from "./Schema/User.js";
import Blog from "./Schema/Blog.js";


const server=express()

let PORT=3000;

admin.initializeApp({
    credential: admin.credential.cert(serviceAccountKey)
})

 

let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/; // regex for email
let passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{6,20}$/; // regex for password

server.use(express.json())
server.use(cors());

mongoose.connect(process.env.DB_LOCATION,{ autoIndex:true})

//setting s3 bucket
const s3 = new aws.S3({
    
    region : 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
})

const generateUploadUrl =async ()=> {
    const date =new Date();
    const imageName = `${nanoid()}-${date.getTime()}.jpeg`;

    return await s3.getSignedUrlPromise('putObject', {
        Bucket : 'blog-website-krati',
        Key :  imageName,
        Expires : 10000,
        ContentType : "image/jpeg"

    })
}


const verifyJWT=(req, res, next)=>{
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if(token==null){
        return res.status(401).json({error:"no token"})
    }
    jwt.verify(token, process.env.SECRET_ACCESS_KEY, (err, user)=>{
        if(err){
            return res.status(403).json({error:"invalid token"})
        }
        req.user = user.id;
        next();
    })
}


const formatDatatoSend=(user)=>{
    const access_token=jwt.sign({id:user._id}, process.env.SECRET_ACCESS_KEY)
    return {
        access_token,
        profile_img : user.personal_info.profile_img,
        username : user.personal_info.username,
        fullname:user.personal_info.fullname

    }
}

const generateUsername=async(email)=>{
    let username=email.split("@")[0];
    let isUsernameNotUnique=await User.exists({"personal_info.username": username }).then((result)=>result)
    isUsernameNotUnique? username+=nanoid().substring(0,5):"";
    return username;
}

// upload image url route
server.get('/get-upload-url', (req,res)=>{
    //nsole.log("djnnfd");
    generateUploadUrl().then(url =>
        res.status(200).json({uploadURL : url})
    ).catch(err => {
        console.log(err.message);
        return res.status(500).json({error : err.message})
    })
})


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
    bcrypt.hash(password,10, async (err,hashed_password)=>{
        let username= await generateUsername(email);
        let user=new User({
            personal_info:{fullname, email, password:hashed_password, username}
        })

        user.save().then((u)=>{
            return res.status(200).json(formatDatatoSend(u))
        })
        .catch(err=>{
            if(err.code==11000){
                return res.status(500).json({"error" : "Email already exists"})
            }
            return res.status(500).json({"error":err.message})
        })
    })

    
})

server.post("/signin", (req,res)=>{
    let {email,password}=req.body;
    User.findOne({"personal_info.email":email}).then((user)=>{
        if(!user){
            return res.status(403).json({"error":"Email not found"});
        }
        if(user.google_auth){
            return res.status(403).json({"error" : "Account was created using google"})
        }
        else {
        bcrypt.compare(password, user.personal_info.password, (err, result)=>{
            if(err){
                return res.status(403).json({"error":"error ocuured while login plz try again"})
            }
            if(!result){
                return res.status(403).json({"error":"Invalid password"})
            }
            else{
                return res.status(200).json(formatDatatoSend(user))
            }
        })}
        
    })
    .catch(err=>{
        console.log(err.message);
        return res.status(500).json({"error":err.message})
    })
})

server.post("/google-auth", async(req,res)=>{
    let {access_token}=req.body;

    getAuth()
    .verifyIdToken(access_token)
    .then(async (decodedUser)=>{
        let {email, name, picture}=decodedUser;
        picture=picture.replace("s96-c", "s384-c")
        let user=await User.findOne({"personal_info.email":email}).select("personal_info.fullname personal_info.username personal_info.profile_img google_auth").then((u)=>{
            return u||null
        }).catch(err=>{
            return res.status(500).json({"error": err.message})
        })

        if(user){
            if(!user.google_auth){
                return res.status(403).json({"error":"This email was signed up without google. Please log in with password"})
            }
        }
        else{
            let username =await generateUsername(email);
            user=new User({
                personal_info:{fullname:name, email,  username},
                google_auth:true
            })

            await user.save().then((u)=>{
                user=u;
            })
            .catch(err=>{
                return res.status(500).json({"error": err.message});
            })
        }
        return res.status(200).json(formatDatatoSend(user))


    })
    .catch(err=>{
        return res.status(500).json({"error": "Failed to authenticate you with google. Try with some other google account"})
    })

})


server.post('/latest-blogs', (req,res)=>{

    let {page}=req.body;

    let maxLimit=5;

    Blog.find({draft:false})
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"publishedAt" : -1})
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page-1)*maxLimit)
    .limit(maxLimit)
    .then(blogs =>{
        return res.status(200).json({blogs : blogs})
    })
    .catch( err=>{
        return res.status(500).json({error: err.message})
    })
})


server.post("/all-latest-blogs-count", (req,res)=>{

    Blog.countDocuments({draft:false})
    .then(count =>{
        return res.status(200).json({totalDocs : count})
    })
    .catch(err=>{
        console.log(err)
        return res.status(500).json({error: err.message})
    })
})


server.get("/trending-blogs", (req,res)=>{
    Blog.find({draft:false})
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"activity.total_read" : -1 , "activity.total_likes" : -1, "publishedAt": -1})
    .select("blog_id title publishedAt -_id")
    .limit(5)
    .then(blogs=>{
        return res.status(200).json({blogs: blogs})
    })
    .catch(err=>{
        return res.status(500).json({error: err.message})
    })
})


server.post("/search-blogs", (req,res)=>{
    let {tag,query, page}=req.body;

    let findQuery;

    if(tag){
        findQuery={tags: tag, draft:false};
    }
    else if(query){
        findQuery={draft:false, title: new RegExp(query, 'i')}
    }

    let maxLimit=1;

    Blog.find(findQuery)
    .populate("author", "personal_info.profile_img personal_info.username personal_info.fullname -_id")
    .sort({"publishedAt" : -1})
    .select("blog_id title des banner activity tags publishedAt -_id")
    .skip((page-1)*maxLimit)
    .limit(maxLimit)
    .then(blogs =>{
        return res.status(200).json({blogs})
    })
    .catch( err=>{
        return res.status(500).json({error: err.message})
    })

})


server.post("/search-blogs-count", (req,res)=>{
    let {tag, query}= req.body;
    let findQuery;

    if(tag){
        findQuery={tags: tag, draft:false};
    }
    else if(query){
        findQuery={draft:false, title: new RegExp(query, 'i')}
    }
    Blog.countDocuments(findQuery)
    .then(count=>{
        return res.status(200).json({totalDocs : count})
    })
    .catch(err=>{
        return res.status(500).json({error: err.message})
    })
})


server.post("/search-users", (req,res)=>{
    let {query}= req.body;
    User.find({"personal_info.username" : new RegExp(query,'i')})
    .limit(50)
    .select("personal_info.fullname personal_info.username personal_info.profile_img -_id")
    .then(users =>{
        return res.status(200).json({users})
    })
    .catch(err=>{
        return res.status(500).json({error: err.message})
    })
})


server.post('/create-blog',verifyJWT, (req,res)=>{

    let authorId = req.user;
    let {title, des, banner, tags, content, draft}=req.body;
    if(!title.length){
        return res.status(403).json({error : "no title"})
    }
    if(!draft){
        if(!des.length || des.length>200){
            return res.status(403).json({error : "no description or description is too long"})
        }
        if(!banner.length){
            return res.status(403).json({error : "no banner"})
        }
        if(!content.blocks.length){
            return res.status(403).json({error : "no content"})
        }
        if(!tags.length || tags.length>10){
            return res.status(403).json({error : "no tags or more than 10"})
        }
    }

    tags= tags.map(tag => tag.toLowerCase());

    let blog_id=title.replace(/[^a-zA-Z0-9]/g, ' ').replace(/\s+/g, "-").trim()+nanoid()
    //console.log(blog_id);
    

    let blog = new Blog ({
        title, des, banner , content, tags, author : authorId, blog_id ,draft : Boolean(draft)
    })

    blog.save().then(blog =>{
        let incrementVal = draft ? 0: 1;
        User.findOneAndUpdate({ _id: authorId}, { $inc : {"account_info.total_posts" : incrementVal}, $push : {"blogs" : blog._id} })
        .then(user=>{
            return res.status(200).json({id: blog.blog_id})
        })
        .catch(err=>{
            return res.status(500).json({"error": "Failed to create blog"+err.message})
        })
    })
    .catch(err=>{
        return res.status(500).json({"error": err.message})
    })

    //return res.json({status: "done"})
})



server.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`)
})