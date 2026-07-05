const jwt = require("jsonwebtoken");
function authMiddleware(req,res,next){
    const token = req.headers.token;//jwt
    const decoded = jwt.verify(token,"supersecretPassword123");
    const userId = decoded.userId;
    if(userId){
        req.userId = userId;
        next();
    }else{
        res.status(403).json({
            message:"Token is incorrect"
        })
    }
}
module.exports = {
    authMiddleware: authMiddleware
}