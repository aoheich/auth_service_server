import { Router } from "express"
import { jwt_signup,  jwt_login, token_refresh, jwt_logout, session_signup, session_login, session_logout } from "./middlewares/controller.js"
import { token_auth, role_auth } from "./middlewares/jwt_auth.js"
import { sesh_auth, sesh_role_auth } from "./middlewares/session_auth.js"

const router = Router()

router.post("/jwt/register", jwt_signup)

router.post("/jwt/login", jwt_login)

router.post("/jwt/refresh", token_refresh)

router.post("/jwt/logout", jwt_logout)

router.get("/jwt/profile", token_auth, (req, res) => {
    return res.status(200).json({
        email: req.user.email,
        id: req.user.id,
        role: req.user.role
    })
} )

router.get("/jwt/admin", token_auth, role_auth("ADMIN"), (req, res) => {
    return res.status(200).json({
        msg: "Admin-Only"
    })
})

router.post("/session/register", session_signup)

router.post("/session/login", session_login)

router.post("/session/logout", session_logout)

router.get("/session/profile", sesh_auth, (req, res) => {
    return res.status(200).json({
        id: req.user.id,
        role: req.user.role,
        email: req.user.email
    })
} )

router.get("/session/admin", sesh_auth, sesh_role_auth("ADMIN"), (req, res) => {
    return res.status(200).json({
        msg: "Admin-Only"
    })
})


export default router