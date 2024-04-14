const router = require('express').Router();
const {verifyToken, verifyTokenAndAdmin}=require("../middlewares/verifyToken")
const {createCommentCtrl, getAllCommentCtrl, deleteCommentCtrl, updateCommentCtrl}=require('../controllers/commentController');
const { validateObjectId } = require('../middlewares/validateObjectId');

// /api/comments
router.post("/",verifyToken,createCommentCtrl)
router.get("/",verifyTokenAndAdmin,getAllCommentCtrl)

// /api/comment/:id
router.delete("/:id",validateObjectId,verifyToken,deleteCommentCtrl)
router.put("/:id",validateObjectId,verifyToken,updateCommentCtrl)

module.exports=router;
