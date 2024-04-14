const router=require('express').Router();
const { createPostCtrl, getAllPostsCtrl, getSinglePostsCtrl, getPostCountCtrl, deletePostsCtrl, updatePostCtrl, updatePostImageCtrl, toggleLikeCtrl } = require('../controllers/postsController');
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
router.put("/:id",validateObjectId,verifyToken,updatePostCtrl)


// api/posts/update-image/:id
router.put("/update-image/:id",validateObjectId,verifyToken,photoUpload.single("image"),updatePostImageCtrl)

//api/posts/like/:id 
router.put("/like/:id",validateObjectId,verifyToken,toggleLikeCtrl)


module.exports=router;