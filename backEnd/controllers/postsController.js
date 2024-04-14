const fs =require("fs");
const path = require('path');
const asyncHandler=require("express-async-handler");
const {Post,validateCreatePos,validateUpdatePost}=require("../models/Post");
const {cloudinaryUploadImage, cloudinaryRemoveImage}=require("../utils/cloudinary");
const {Comment}=require("../models/Comments")


/**------------------------------------------
 *
 *   @desc    Create New Post
 *   @route   POST /api/posts
 *   @method Post
 *   @access Private (only logged in user)
----------------------------------------- */

module.exports.createPostCtrl=asyncHandler(async(req,res)=>{
    //validate image
  if(!req.file){
    return res.status(400).json({message:"No image Provided"});
  }
  //validate data
  const {error}=validateCreatePost(req.body);
  if(error){
    return res.status(400).json({message:error.details[0].message});
  }
  //upload photo 

  const imagePath=path.join(__dirname,`../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  //create new post and save it to DB
  const post= await Post.create({
    title:req.body.title,
    description:req.body.description,
    category:req.body.category,
    user:req.user.id,
    image:{
        url:result.secure_url,
        publicId:result.public_id,
    }
  });
  //send response to the client
  res.status(201).json(post);
  //remove image from the server
  fs.unlinkSync(imagePath);
});

/**------------------------------------------
 *
 *   @desc    Get all  Posts
 *   @route    /api/posts
 *   @method Get
 *   @access Public (only logged in user)
----------------------------------------- */

module.exports.getAllPostsCtrl=asyncHandler(async(req,res)=>{
    const POST_PER_PAGE=3;
    const {pageNumber,category}=req.query;
    let posts;
    if(pageNumber){
        posts= await Post.find()
            .skip((pageNumber-1)*POST_PER_PAGE)
            .limit(POST_PER_PAGE).sort('-createdAt')
    }else if (category){
        posts=await Post.find({category}).sort('-createdAt')
    }else{
        posts=await Post.find(
          ).sort('-createdAt').populate("user",["-password"])
    }
    res.status(200).json(posts)

})

/**------------------------------------------
 *
 *   @desc    Get Single  Posts
 *   @route    /api/posts/:id
 *   @method Get
 *   @access Public (only logged in user)
----------------------------------------- */

module.exports.getSinglePostsCtrl=asyncHandler(async(req,res)=>{
  
    const post =await Post.findById(req.params.id).populate("user",["-password"]).populate("comments");
    if(!post){
        return res.status(404).json({message: "post not found"});
    }
    
    res.status(200).json(post)

})

/**------------------------------------------
 *
 *   @desc    Get Posts Count
 *   @route    /api/posts/count
 *   @method Get
 *   @access Public (only logged in user)
----------------------------------------- */

module.exports.getPostCountCtrl=asyncHandler(async(req,res)=>{
  
    const count =await Post.countDocuments();
    
    
    res.status(200).json(count)

})

/**------------------------------------------
 *
 *   @desc    Delete  Post
 *   @route    /api/posts/:id
 *   @method Delete
 *   @access Private (only admin or owner of the post)
----------------------------------------- */

module.exports.deletePostsCtrl=asyncHandler(async(req,res)=>{
  
    const post =await Post.findById(req.params.id);
    if(!post){
        return res.status(404).json({message: "post not found"});
    }

    
    if(req.user.isAdmin || req.user.id ===  post.user.toString()){
      await Post.findByIdAndDelete(req.params.id);
      await cloudinaryRemoveImage(post.image.publicId);

      //Delete All comments that belong to this Post
      await Comment.deleteMany({postId:post._id})
      res.status(200).json({message:"post has been deleted successfully",postId:post._id})
    }else{
        res.status(403).json({message:"access denied Forbiden"})
    }

})

/**------------------------------------------
 *
 *   @desc    Update  Post
 *   @route    /api/posts/:id
 *   @method PUT
 *   @access Private (only  owner of the post)
----------------------------------------- */

module.exports.updatePostCtrl=asyncHandler( async (req,res,) => {
   //validation
    const {error}=validateUpdatePost(req.body);
   if(error){
    res.status(400).json({message:error.details[0].message});
   }
   //get the post from DB and check if it exist
   const post=await Post.findById(req.params.id);
   if (!post) {
       return res.status(404).json({ message:'Post Not found' });
   }
   //3 .check if this post belong to logged in user
   if(req.user.id != post.user.toString()) {
    return res.status(403).json({message:"access denied ,Forbidden"})
   }
   //update Post 
   const updatedPost=await Post.findByIdAndUpdate(req.params.id,{
    $set:{
        title:req.body.title,
        description:req.body.description,
        category:req.body.category,
    }
   },{new:true}).populate("user",["-password"]);//return new data not old one

   // Send  response to the client 

   res.status(200).json(updatedPost)
})

/**------------------------------------------
 *
 *   @desc    Update  Post image
 *   @route    /api/posts/upload-image/:id
 *   @method PUT
 *   @access Private (only  owner of the post)
----------------------------------------- */

module.exports.updatePostImageCtrl=asyncHandler( async (req,res,) => {
    //validation
     
    if(!req.file){
     res.status(400).json({message:"no image provided"});
    }
    //get the post from DB and check if it exist
    const post=await Post.findById(req.params.id);
    if (!post) {
        return res.status(404).json({ message:'Post Not found' });
    }
    //3 .check if this post belong to logged in user
    if(req.user.id != post.user.toString()) {
     return res.status(403).json({message:"access denied ,Forbidden"})
    }
    //delete the old Post image
    await cloudinaryRemoveImage(post.image.publicId)
   
    // upload new post image
    const imagePath=path.join(__dirname,`../images/${req.file.filename}`)
    const result =await cloudinaryUploadImage(imagePath);

    //update image filed in the db
    const updatedPost=await Post.findByIdAndUpdate(req.params.id,{
        $set:{
           image:{
            url:result.secure_url,
             publicId:result.public_id
           }
        }
       },{new:true})
 
   //send response to client 

   res.status(200).json(updatedPost);

   //remove image from the server 

   fs.unlinkSync(imagePath);

 });
 
/**------------------------------------------
 *
 *   @desc    Toggle Like 
 *   @route    /api/posts/like/:id
 *   @method PUT
 *   @access Private (only logged in user)
----------------------------------------- */

module.exports.toggleLikeCtrl=asyncHandler( async(req,res)=>{
    const loggedInUser=req.user.id
    const {id:postId}=req.params;
    let post=await Post.findById(postId);
    if(!post){
        return res.status(404).json({message: 'Post not found'})
    }
    const isPostAlreadyLiked=post.likes.find((user)=>user.toString()===loggedInUser);
    if(isPostAlreadyLiked){
        post=await Post.findByIdAndUpdate(
        postId,
        {
            $pull:{likes:loggedInUser}
        },
        {new:true});
    }else{
        post=await Post.findByIdAndUpdate(
            postId,
            {
                $push:{likes:loggedInUser}
            },
            {new:true});
    }
    res.status(200).json(post)
})