const asyncHandler=require("express-async-handler");
const {Comment,validateCreateComment,validateUpdateComment}=require("../models/Comments")
const {User}=require("../models/User")

/**------------------------------------------
 *
 *   @desc    Create New Comment
 *   @route    /api/comments
 *   @method Post
 *   @access Private (only logged in user)
----------------------------------------- */

module.exports.createCommentCtrl=asyncHandler(async(req,res)=>{
    const {error}=validateCreateComment(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }

    const profile=await User.findById(req.user.id)
    const comment =await Comment.create({
        postId:req.body.postId,
        text: req.body.text,
        user:req.user.id,
        username:profile.username,
    });
    res.status(201).json(comment);
})

/**------------------------------------------
 *
 *   @desc    get all  Comments
 *   @route    /api/comments
 *   @method Get
 *   @access private (only admin)
----------------------------------------- */

module.exports.getAllCommentCtrl=asyncHandler(async(req,res)=>{
   const comments = await Comment.find().populate("user",["-password"]);
    res.status(200).json(comments);
})


/**------------------------------------------
 *
 *   @desc    delete  Comment
 *   @route    /api/comments/:id
 *   @method DELETE
 *   @access private (only admin or owner of the comment)
----------------------------------------- */

module.exports.deleteCommentCtrl=asyncHandler(async(req,res)=>{
   const comment = await Comment.findById(req.params.id);
   if(!comment){
    return res.status(404).json({message:"Comment Not found"})
   }
   if(req.user.isAdmin || req.user.id === comment.user.toString()){
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({message:'comment has been deleted'});
   }else{
    res.status(403).json({message:'Not Authorized , FORBIDEN'});
   }
 })
 
/**------------------------------------------
 *
 *   @desc    Update Comment
 *   @route    /api/comments/:id
 *   @method PUT
 *   @access Private (only owner of the comment)
----------------------------------------- */

module.exports.updateCommentCtrl=asyncHandler(async(req,res)=>{
    const {error}=validateUpdateComment(req.body);
    if(error){
        return res.status(400).json({message:error.details[0].message})
    }

    const comment = await Comment.findById(req.params.id);
    if(!comment){
     return res.status(404).json({message:"Comment not Found!"})
    }

    //Check user is authorized to
    if(req.user.id !== comment.user.toString()) {
       return res.status(403).json({message:"Not Authorized , Forbidden"})
    }

    const updatedComment =  await Comment.findByIdAndUpdate(req.params.id,{
        $set:{
            text:req.body.text,
        }
    },{new:true});

    res.status(201).json(updatedComment);
})
