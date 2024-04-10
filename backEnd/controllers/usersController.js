const asyncHandler= require("express-async-handler");
const {User}=require('../models/User');


/**------------------------------------------
 *
 *   @desc    Get all users Profile
 *   @route   POST /api/users/profile
 *   @method Get
 *   @access private (only admin)
----------------------------------------- */

module.exports.getAllUsersCtrl=asyncHandler(async(req,res)=>{
    const users=await User.find();
    res.status(200).json({success:true,data:users});

});