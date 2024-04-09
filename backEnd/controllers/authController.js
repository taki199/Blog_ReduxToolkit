const asyncHandler= require("express-async-handler");
const bcrypt = require("bcryptjs");
const {User,validateRegisterUser, validateLoginUser}=require("../models/User")


/**------------------------------------------
 *
 * @desc    Register a new user
 *  @route   POST /api/auth/register
 * @method Post
 * @access public
 * 
----------------------------------------- */
module.exports.registerUserCtrl=asyncHandler(async(req,res)=>{
   const {error}=validateRegisterUser(req.body)
   if (error) return res.status(400).json({message: error.details[0].message})
   let user=await User.findOne({email: req.body.email});
   if (user){
    return res.status(400).json({message:'Email already in use'});
   }

   const salt=await bcrypt.genSalt(10);
   const hashedPassword = await  bcrypt.hash(req.body.password,salt)

   user = new User({
    username:req.body.username,
    email:req.body.email,
    password:hashedPassword,
   });

   await user.save();
    // @TODO---- sending email (verify account if not verified )

   res.status(201).json({message:"User created successfully" , data :{...user._doc}})
});

/**------------------------------------------
 *
 * @desc    Login  user
 *  @route   POST /api/auth/login
 * @method Post
 * @access public
 * 
----------------------------------------- */

module.exports.loginUserCtrl=asyncHandler(async(req,res)=>{
    const {error}=validateLoginUser(req.body)
   if (error) return res.status(400).json({message: error.details[0].message})
   let user=await User.findOne({email: req.body.email});
   if (!user){
   return  res.status(400).json({message:'Invalid credentials'})
   }

   const isPasswordMatch =await bcrypt.compare(req.body.password, user.password)
   if (!isPasswordMatch){
    return  res.status(400).json({message:'Invalid credentials'})
    }

    // @TODO---- sending email (verify account if not verified )

   const token=user.generateAuthToken();

   res.status(200).json({
    _id:user._id,
    isAdmin:user.isAdmin,
    profilePhoto:user.profilePhoto,
    token,
   })
    

});