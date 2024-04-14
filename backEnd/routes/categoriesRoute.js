const router = require('express').Router();
const { createCategoryCtrl, getAllCategoriesCtrl, deleteCategoriesCtrl } = require('../controllers/categoryController');
const { verifyTokenAndAdmin }=require('../middlewares/verifyToken')
const {validateObjectId}=require('../middlewares/validateObjectId')


// //api/categories

router.post( '/',verifyTokenAndAdmin,createCategoryCtrl);
router.get("/",getAllCategoriesCtrl)

// //api/categories/:id
router.delete("/:id",validateObjectId,verifyTokenAndAdmin,deleteCategoriesCtrl)

module.exports=router;