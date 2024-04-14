const asyncHandler=require("express-async-handler");
const {Category,validateCreateCategory}=require("../models/Category")


/**------------------------------------------
 *
 *   @desc    Create New category
 *   @route    /api/categories
 *   @method Post
 *   @access Private (only admin)
----------------------------------------- */

module.exports.createCategoryCtrl=asyncHandler(async(req,res)=>{
    //validate 
    const {error} = validateCreateCategory(req.body);
    if(error){
        return res.status(400).json({message: error.details[0].message})
    }
    const category = await Category.create({
        title:req.body.title,
        user:req.user.id
    })  
    res.status(201).json(category)
});
/**------------------------------------------
 *
 *   @desc    get all categories
 *   @route    /api/categories
 *   @method get
 *   @access public 
----------------------------------------- */

module.exports.getAllCategoriesCtrl=asyncHandler(async(req,res)=>{
   const categories=await Category.find();
    res.status(200).json(categories)
});

/**------------------------------------------
 *
 *   @desc   delete category
 *   @route    /api/categories/:id
 *   @method Delete
 *   @access private (only admin)
----------------------------------------- */

module.exports.deleteCategoriesCtrl=asyncHandler(async(req,res)=>{
    const category=await Category.findById(req.params.id);
    if(!category){
        return res.status(404).json('category not found');
    } 
    await Category.findByIdAndDelete(req.params.id);
     res.status(200).json({message:"category has been deleted successfully ", categoryId:category._id})
 });