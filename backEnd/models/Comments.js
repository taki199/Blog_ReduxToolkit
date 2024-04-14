const mongoose = require('mongoose');
const Joi = require("joi")

//Comment Schema

const CommentSchema=new mongoose.Schema({
    PostId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Post",
        required:true,

    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,

    },
    text:{
        type:String,
        required:true,

    },
    username:{
        type:String,
        required:true,

    },

},{timestamps:true,
})

const Comment=mongoose.model("Comment",CommentSchema);

//validate Create Comment
function validateCreateComment(obj){
    const schema=Joi.object({
        postId:Joi.string().required(),
        text:Joi.string().required(),
    })
    return schema.validate(obj)
}
//validate Create Comment
function validateUpdateComment(obj){
    const schema=Joi.object({
        text:Joi.string().required(),
    })
    return schema.validate(obj)
}

module.exports={
    Comment,
    validateCreateComment,
    validateUpdateComment,
}