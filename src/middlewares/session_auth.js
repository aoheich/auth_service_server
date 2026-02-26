export const sesh_auth = (req, res, next) => {
    

    if(!req.session ||!req.session.user) {
        console.log(req.session)
         return res.status(401).json({msg: "Not Authenticated"})
    } 

    req.user = req.session.user

    next()
}

export const sesh_role_auth = (...allowedroles) => { return (req, res, next) => {
    if(!req.user || !req.user.role || !allowedroles.includes(req.user.role)) {
        return res.status(403).json({msg: "Unauthorized Access"})
    }

    next()
}}