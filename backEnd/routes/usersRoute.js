const router =require("express").Router();
const { getAllUsersCtrl } = require("../controllers/usersController");





//api/users/profile

router.get("/profile",getAllUsersCtrl)

module.exports=router;