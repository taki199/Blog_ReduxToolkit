const router=require('express').Router();
const { createPostCtrl, getAllPostsCtrl, getSinglePostsCtrl, getPostCountCtrl, deletePostsCtrl } = require('../controllers/postsController');
const photoUpload=require('../middlewares/photoUpload');
const {verifyToken}=require("../middlewares/verifyToken")
const {validateObjectId}=require("../middlewares/validateObjectId")

// api/posts

router.post("/",verifyToken,photoUpload.single("image"),createPostCtrl)
router.get("/",getAllPostsCtrl)

// api/posts/count
router.get("/count",getPostCountCtrl)

// api/posts/:id
router.get("/:id",validateObjectId,getSinglePostsCtrl)
router.delete("/:id",validateObjectId,verifyToken,deletePostsCtrl)



module.exports=router;