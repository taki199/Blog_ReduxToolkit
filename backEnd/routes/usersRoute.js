const router =require("express").Router();
const { getAllUsersCtrl, getUserProfileCtrl, updateUserProfileCtrl, getUsersCountCtrl } = require("../controllers/usersController");
const { validateObjectId } = require("../middlewares/validateObjectId");
const { verifyTokenAndAdmin, verifyTokenAndOnlyUser } = require("../middlewares/verifyToken");





//api/users/profile

router.get("/profile",validateObjectId,verifyTokenAndAdmin,getAllUsersCtrl)


//api/users/profile/:id
router.get("/profile/:id",validateObjectId,getUserProfileCtrl)
router.put("/profile/:id",validateObjectId,verifyTokenAndOnlyUser,updateUserProfileCtrl)

//api/users/count

router.get("/count",verifyTokenAndAdmin,getUsersCountCtrl)

module.exports=router;