import bcrypt from "bcrypt"
import { PrismaClient } from "../../generated/prisma/client.ts"
import jwt from "jsonwebtoken"
import crypto from "crypto"

const prisma = new PrismaClient()
const pepper = process.env.PEPPER
const access_secret = process.env.ACCESS_T_SECRET
const refresh_secret = process.env.REFRESH_T_SECRET

export const session_signup = async (req, res) => {
    try {

        const { email, password } = req.body

        const existingUser = await prisma.user.findUnique({ where: { email: email } })
        if (existingUser) return res.status(400).json({ msg: "Email already exists" })

        const hashed_password = await bcrypt.hash(password + pepper, 10)

        const user = await prisma.user.create({
            data: {
                email: email,
                password: hashed_password
            }
        })

        await new Promise((resolve, reject) => {
            req.session.regenerate(err => {
                if (err) return reject(err)

                req.session.user = {
                    id: user.id,
                    role: user.role,
                    email: user.email
                }

                resolve()
            })
        })

        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) return reject(err)
                resolve()
            })
        })

        await prisma.session.update({
            where: { sid: req.sessionID },
            data: { user_id: user.id }
        })

        res.status(201).json({ msg: "User created Successfully" })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ msg: "Internal Server Error" })
    }
}

export const session_login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findFirst({
            where: { email: email }
        })

        if (!user) {
            return res.status(401).json({ msg: "Invalid Credentials" })
        }

        const result = await bcrypt.compare(password + pepper, user.password)

        if (!result) {
            return res.status(401).json({ msg: "Invalid Credentials" })
        }

        await new Promise((resolve, reject) => {
            req.session.regenerate(err => {
                if (err) return reject(err)

                req.session.user = {
                    id: user.id,
                    role: user.role,
                    email: user.email
                }

                resolve()
            })
        })

        await new Promise((resolve, reject) => {
            req.session.save(err => {
                if (err) return reject(err)
                resolve()
            })
        })

        await prisma.session.update({
            where: { sid: req.sessionID },
            data: { user_id: user.id }
        })

        res.status(200).json({ msg: "Login Successfull" })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ msg: "Internal Server Error" })
    }
}

export const session_logout = async (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error(err)
                return res.status(500).json({ msg: "Internal Server Error" })
            }

            res.clearCookie("connect.sid", { httpOnly: true, secure: false })
            res.status(200).json({ msg: "Logout Successful" })
        })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ msg: "Internal Server Error" })
    }
}

export const jwt_signup = async (req, res) => {
    try {
        const { email, password } = req.body

        const existingUser = await prisma.user.findUnique({ where: { email: email } })
        if (existingUser) return res.status(400).json({ msg: "Email already exists" })

        const hashed_password = await bcrypt.hash(password + pepper, 10)

        const user = await prisma.user.create({
            data: {
                email: email,
                password: hashed_password
            }
        })

        const token_id = crypto.randomUUID()

        const payload = {
            user_id: user.id,
            role: user.role,
            token_version: user.token_version,
            id: token_id
        }

        const access_token = jwt.sign(payload, access_secret, { expiresIn: "15m" })
        const refresh_token = jwt.sign(payload, refresh_secret, { expiresIn: "1d" })

        const hashed_token = await bcrypt.hash(refresh_token, 10)

        await prisma.tokens.create({
            data: {
                id: token_id,
                token: hashed_token,
                user_id: user.id,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24)
            }
        })

        res.cookie("refresh_token", refresh_token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: false })

        res.status(201).json({ msg: "User created Successfully", access_token: access_token })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ msg: "Internal Server Error" })
    }
}

export const jwt_login = async (req, res) => {
    try {
        const { email, password } = req.body

        const user = await prisma.user.findFirst({
            where: { email: email }
        })

        if (!user) {
            return res.status(401).json({ msg: "Invalid Credentials" })
        }

        const result = await bcrypt.compare(password + pepper, user.password)

        if (!result) {
            return res.status(401).json({ msg: "Invalid Credentials" })
        }

        const token_id = crypto.randomUUID()

        const payload = {
            id: token_id,
            user_id: user.id,
            role: user.role,
            token_version: user.token_version
        }

        const access_token = jwt.sign(payload, access_secret, { expiresIn: "15m" })
        const refresh_token = jwt.sign(payload, refresh_secret, { expiresIn: "1d" })

        const hashed_token = await bcrypt.hash(refresh_token, 10)

        await prisma.tokens.create({
            data: {
                id: token_id,
                token: hashed_token,
                user_id: user.id,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24)
            }
        })

        res.cookie("refresh_token", refresh_token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: false })

        res.status(200).json({ msg: "Login Successfull", access_token: access_token })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ msg: "Internal Server Error" })
    }
}

export const jwt_logout = async (req, res) => {
    try {
        const refresh_token = req.cookies.refresh_token

        if (!refresh_token) {
            return res.status(401).json({ msg: "Token Missing" })
        }

        const payload = jwt.verify(refresh_token, refresh_secret)

        const db_token = await prisma.tokens.findFirst({
            where: {
                id: payload.id,
                revoked: false,
                expires_at: { gt: new Date() }
            }
        })

        if (!db_token) {
            return res.status(401).json({ msg: "Invalid Token" })
        }

        await prisma.tokens.delete({
            where: { id: db_token.id }
        })

        res.clearCookie("refresh_token", { httpOnly: true, secure: false })

        res.status(200).json("Logout Successful")

    } catch (error) {
        console.error(error)
        return res.status(500).json({ msg: "Internal Server Error" })
    }
}

export const token_refresh = async (req, res) => {
    try {
        const refresh_token = req.cookies.refresh_token

        if (!refresh_token) {
            return res.status(401).json({ msg: "Token Missing" })
        }

        const payload = jwt.verify(refresh_token, refresh_secret)

        const db_token = await prisma.tokens.findFirst({
            where: {
                id: payload.id,
                revoked: false,
                expires_at: { gt: new Date() }
            }
        })

        if (!db_token) {
            return res.status(401).json({ msg: "Invalid Token" })
        }

        await prisma.tokens.update({
            where: { id: db_token.id },
            data: { revoked: true }
        })

        const token_id = crypto.randomUUID()

        const new_payload = {
            id: token_id,
            user_id: payload.user_id,
            role: payload.role,
            token_version: payload.token_version
        }

        const new_access_token = jwt.sign(new_payload, access_secret, { expiresIn: "15m" })
        const new_refresh_token = jwt.sign(new_payload, refresh_secret, { expiresIn: "1d" })

        const hashed_token = await bcrypt.hash(new_refresh_token, 10)

        await prisma.tokens.create({
            data: {
                id: token_id,
                token: hashed_token,
                user_id: payload.user_id,
                expires_at: new Date(Date.now() + 1000 * 60 * 60 * 24)
            }
        })

        res.cookie("refresh_token", new_refresh_token, { maxAge: 1000 * 60 * 60 * 24, httpOnly: true, secure: true })

        res.status(200).json({ msg: "Refresh Successfull", access_token: new_access_token })

    } catch (error) {
        console.error(error)
        return res.status(500).json({ msg: "Internal Server Error" })
    }
}