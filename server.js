import express from "express"
import cookieParser from "cookie-parser"
import router from "./src/routes.js"
import session_config from "./src/middlewares/session_config.js"

const port = process.env.PORT

const app = express()
app.use(express.json())
app.use(cookieParser())
app.use(session_config)
app.use("/api", router)


app.listen(port, () => {
    console.log(`Listening on ${port}`)
})