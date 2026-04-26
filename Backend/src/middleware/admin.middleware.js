import userModel from '../models/user.model.js'

async function isAdmin(req , res , next){

    try {

        if(!req.user){
            return res.status(401).json({
                message: "Unauthorized",
            })
        }

        const user = await userModel.findById(req.user.id).select("role");

        if (!user || user.role !== "admin") {
          return res.status(403).json({
            message: "Access denied. Admins only",
          });
        }
    
        next();
        
    } catch (error) {
        return res.status(500).json({
            message: "Server error",
        });
    }

}

export default isAdmin; 
