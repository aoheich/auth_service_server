import session from "express-session";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import { PrismaClient } from "../../generated/prisma/client.ts";

const prisma = new PrismaClient()

const session_config = session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        name: "connect.sid",
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        secure: false
    },
    store: new PrismaSessionStore(prisma, {
        checkPeriod: 10 * 60 * 10000
    })
}) 

export default session_config