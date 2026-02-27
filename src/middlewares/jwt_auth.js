import { PrismaClient } from "../../generated/prisma/client.ts"
import jwt from "jsonwebtoken"

const prisma = new PrismaClient()

export const token_auth = async (req, res, next) => {
    try {
        const auth_header = req.headers["authorization"]
        if(!auth_header) {
            return res.status(401).json("Authorization Required")
        }

        const parts = auth_header.split(" ")

        if (parts.length !== 2 || parts[0] !== "Bearer") {
            return res.status(401).json({ msg: "Invalid Authorization Format" })
        }

        const token = parts[1]
        const payload = jwt.verify(token, process.env.ACCESS_T_SECRET)
        const db_user = await prisma.user.findFirst({
            where: {
                id: payload.user_id
            }, select: {
                token_version: true,
                email: true,
                role: true,
                id: true
            }
        })

        if (!db_user) {
            return res.status(401).json({ msg: "Invalid Credentials" })
        }


        if(payload.token_version !== db_user.token_version) {
           return res.status(401).json({msg: "Token Invalidated"})
        }
        
        req.user = { id: payload.user_id, role: payload.role, email: db_user.email }
        next()

    } catch (error) {
        console.error(error)
       return res.status(401).json({ msg: "Invalid or Expired Token" })
    }
} 

export const role_auth = (...allowedroles) => { return (req, res, next) => {
    
    if(!req.user || !req.user.role || !allowedroles.includes(req.user.role)) {
        return res.status(403).json({msg: "Unauthorized Access"})
    } 
    next()
}
}