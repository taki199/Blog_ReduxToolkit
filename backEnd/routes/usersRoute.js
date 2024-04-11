const router =require("express").Router();
const { getAllUsersCtrl, getUserProfileCtrl, updateUserProfileCtrl, getUsersCountCtrl, profilePhotoUploaderCtrl } = require("../controllers/usersController");
const photoUpload = require("../middlewares/photoUpload");
const { validateObjectId } = require("../middlewares/validateObjectId");
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser, verifyToken } = require("../middlewares/verifyToken");





//api/users/profile

router.get("/profile",validateObjectId,verifyTokenAndAdmin,getAllUsersCtrl)


//api/users/profile/:id
router.get("/profile/:id",validateObjectId,getUserProfileCtrl)
router.put("/profile/:id",validateObjectId,verifyTokenAndOnlyUser,updateUserProfileCtrl)

//api/users/profile/profile-photo-upload

router.post("/profile/profile-photo-upload",verifyToken,photoUpload.single("image"),profilePhotoUploaderCtrl)

//api/users/count

router.get("/count",verifyTokenAndAdmin,getUsersCountCtrl)

module.exports=router;