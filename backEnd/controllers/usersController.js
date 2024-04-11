const asyncHandler= require("express-async-handler");
const {User, validateUpdateUser}=require('../models/User');
const bcrypt = require("bcryptjs");
const path=require("path");
const {cloudinaryUploadImage,cloudinaryRemoveImage}=require('../utils/cloudinary');
const fs=require("fs");
const { url } = require("inspector");

/**------------------------------------------
 *
 *   @desc    Get all users Profile
 *   @route   POST /api/users/profile
 *   @method Get
 *   @access private (only admin)
----------------------------------------- */

module.exports.getAllUsersCtrl=asyncHandler(async(req,res)=>{
  
    
    const users=await User.find().select("-password");;
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
  
    
    const user=await User.findById(req.params.id).select("-password");
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
    console.log(req.user)
    const user =await User.findById(req.user.id);
    

    console.log('User:', user);
    console.log('Profile photo:', user ? user.profilePhoto : null);

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