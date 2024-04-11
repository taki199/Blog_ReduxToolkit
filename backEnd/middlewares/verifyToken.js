const jwt = require('jsonwebtoken')

function verifyToken(req,res,next){
    const authToken=req.headers.authorization;
    if(authToken){
     const token=authToken.split(" ")[1] 
      try {

        const decodedPayload=jwt.verify(token,process.env.JWT_SECRET)
        req.user=decodedPayload;
        next();
        
      } catch (error) {
        return res.status(403).json({message:"Invalid Token,acces denied"})
      }
    }else{
        return res.status(401).json({message:"no token provided,access denied"})
    }
}
//verify token & admin
function verifyTokenAndAdmin(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.isAdmin){
            next();

        }else{
            return res.status(403).json({success:false,message:"not allowed only admin"});
        }
    })

}

//verofy token and only User Himself 
function verifyTokenAndOnlyUser(req,res,next){
    verifyToken(req,res,()=>{
        if(req.user.id===req.params.id ){
            next();

        }else{
            return res.status(403).json({success:false,message:"not allowed only user himself"});
        }
    })

}
module.exports
={verifyToken,verifyTokenAndAdmin,verifyTokenAndOnlyUser};