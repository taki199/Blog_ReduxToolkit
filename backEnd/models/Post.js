const mongoose = require("mongoose");
const Joi= require("joi");


//Post Schema 

const PostSchema=new mongoose.Schema({
    title:{
        type:String,
        required:true,
        minlength:2,
        maxlength:200,
    },
    description:{
        type:String,
        required:true,
        minlength:10,
        
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
        required:true,
        
    },
    category:{
        type:String,
        required:true,

    },
    image:{
        type:Object,
        default:{
            url:"",
            publicId:null,
        }
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
        }
    ]
},{
    timestamps:true,
    toJSON:{virtuals:true}, //Gets called when
    toObject:{virtuals:true}
});

//populate Comment for this post

PostSchema.virtual("comments",{
    ref:"Comment",
    foreignField:"postId",
    localField:"_id"
})

//Post Model
const Post=mongoose.model("Post",PostSchema)

function validateCreatePost(obj){
    const schema=Joi.object({
        title:Joi.string().trim().min(2).max(200).required(),
        description:Joi.string().trim().min(10).required(),
        category:Joi.string().trim().required(),
        
    })
    return schema.validate(obj);
}
function validateUpdatePost(obj){
    const schema=Joi.object({
        title:Joi.string().trim().min(2).max(200),
        description:Joi.string().trim().min(10),
        category:Joi.string().trim()
        
    })
    return schema.validate(obj);
}
module.exports={validateCreatePost,validateUpdatePost,Post}