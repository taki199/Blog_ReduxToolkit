const asyncHandler= require("express-async-handler");
const {User, validateUpdateUser}=require('../models/User');
const bcrypt = require("bcryptjs");
const path=require("path");
const {cloudinaryUploadImage,cloudinaryRemoveImage, cloudinaryRemoveMultipleImage}=require('../utils/cloudinary');
const fs=require("fs");
const { url } = require("inspector");
const {Post}=require("../models/Post");
const {Comment}=require("../models/Comments")

/**------------------------------------------
 *
 *   @desc    Get all users Profile
 *   @route   POST /api/users/profile
 *   @method Get
 *   @access private (only admin)
----------------------------------------- */

module.exports.getAllUsersCtrl=asyncHandler(async(req,res)=>{
  
    
    const users=await User.find().select("-password").populate("posts");
    res.status(200).json({success:true,data:users});

});

/**------------------------------------------
 *
 *   @desc    Get  user Profile
 *   @route   POST /api/users/profile/:id
 *   @method Get
 *   @access public 
----------------------------------------- */

module.exports.getUserProfileCtrl=asyncHandler(async(req,res)=>{
  
    
    const user=await User.findById(req.params.id).select("-password").populate("posts");
    if(!user){
        return res.status(404).json({success:false,message:"user not found"})
    }

    res.status(200).json({success:true, data:user});

});

/**------------------------------------------
 *
 *   @desc    Update User Profile 
 *   @route   /api/users/profile/:id
 *   @method Put
 *   @access private(only user himself) 
----------------------------------------- */ 

module.exports.updateUserProfileCtrl=asyncHandler(async(req,res)=>{
   const {error}=validateUpdateUser(req.body);
   if(error) {
    return res.status(400).json({message:error.details[0].message});
  }
  if(req.body.password){
   const salt=await bcrypt.genSalt(10);
   req.body.password=await bcrypt.hash(req,body.password,salt);

  }

  const updatedUser=await User.findByIdAndUpdate(req.params.id,{
    $set:{
        username:req.body.username,
        password:req.body.password,
        bio:req.body.bio,
    }
  },{new: true}).select('-password');
  res.status(200).json(updatedUser);
});

/**------------------------------------------
 *
 *   @desc    Get  users count
 *   @route   POST /api/users/count
 *   @method Get
 *   @access private (only admin)
----------------------------------------- */

module.exports.getUsersCountCtrl=asyncHandler(async(req,res)=>{
    const count=await User.countDocuments();
    res.status(200).json(count);

});
/**------------------------------------------
 *
 *   @desc    Profile photo Upload
 *   @route   POST /api/users/profile-photo-upload
 *   @method post
 *   @access private (only logged in user)
----------------------------------------- */

module.exports.profilePhotoUploaderCtrl=asyncHandler(async(req,res)=>{
    if(!req.file){
        return res.status(400).json({message:'no file provided'})
    }
    //get the path to the image
    const imagePath=path.join(__dirname,`../images/${req.file.filename}`)
    
    //upload to cloudinary 
    const result=await cloudinaryUploadImage(imagePath);
    //get the user from Db
    
    const user =await User.findById(req.user.id);
    

   

    //delete the old profile photo if exist
    if(user.profilePhoto.publicId!==null){
     await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }

    //change the profile photo filed in the db 
    user.profilePhoto={
        url:result.secure_url,
        publicId:result.public_id
    }

    await user.save();

    res.status(200).json({message:"your profile photo uploaded successfully",
    profilePhoto:{url:result.secure_url,publicId:result.public_id}
});
   //remove image from the server

   fs.unlinkSync(imagePath);



})

/**------------------------------------------
 *
 *   @desc    Delete user Profile(account)
 *   @route   POST /api/users/profile/:id
 *   @method Delete
 *   @access private (only admin or user himself)
----------------------------------------- */

module.exports.deleteUserProfileCtrl=asyncHandler(async(req,res)=>{
    //get user from DB
    const user=await User.findById(req.params.id);
    if(!user){
        return res.status(404).json( { message:'No user found' });
    }

    // - get all posts from DB
   const posts= await Post.find({user:user._id});
    // get the public ids from the posts 
    let publicIds=posts?.map(post=>post.image.publicId )
    // delete all posts image from cloudinary that belong to this user
    if(publicIds?.length>0){
        await cloudinaryRemoveMultipleImage(publicIds)
    }
    //delete the profile picture from cloudinary
    await cloudinaryRemoveImage(user.profilePhoto.publicId);

    //delete user posts & comments
    await  Post.deleteMany({user: user._id})
    await  Comment.deleteMany({user: user._id})

    // delete the user  himself 
    await User.findByIdAndDelete(req.params.id);
    // send a response to the client 
    res.status(200).json({ message: 'The account has been deleted!' })

})  