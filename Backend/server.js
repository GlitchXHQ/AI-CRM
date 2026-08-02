import "dotenv/config"
import express from "express"
import cors from "cors"
import morgan from "morgan"
import dns from "node:dns"
import { connectDB } from "./config/db.js"
import { notFound, errorHandler } from "./middleware/error.middleware.js"
import authRouter from "./routes/auth.routes.js"
import leadRouter from "./routes/lead.routes.js"

dns.setServers(['8.8.8.8', '1.1.1.1'])

const app = express()

app.use(cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true
}))

app.use(express.json({ limit: "1mb" }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"))
}

app.get("/api/health", (req, res) => {
    res.json({ success: true, status: "ok", service: "TTP CRM API" })
})

app.use("/api/auth", authRouter)
app.use("/api/leads", leadRouter)

app.get("/", (req, res) => {
    res.json({ success: true, message: "Welcome to TTP CRM API" })
})

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 8000

const start = async () => {
    try {
        await connectDB()
        app.listen(PORT, () => {
            console.log(`TTP CRM API running on http://localhost:${PORT}`)
        })
    } catch (err) {
        console.log("Failed to start server:", err.message)
        process.exit(1)
    }
}

start()

export default app