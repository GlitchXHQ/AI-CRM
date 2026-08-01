import {User} from "../models/user.model.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/apiError.js"
import { generateToken } from "../utils/generateToken.js"

const toClientUser = (user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    company: user.company,
    avatar: user.avatar,
    createdAt: user.createdAt,
})

export const register = asyncHandler(async (req, res) => {
    const { name, email, password, role, company } = req.body
    if(!name || !email || !password)
        throw new ApiError(400, "Please provide name, email and password") 
    
    const existingUser = await User.findOne({ email: email.toLowerCase() })

    if(existingUser){
        throw new ApiError(409, "User with this email already exists")
    }

    const user = await User.create({
        name,
        email,
        password,
        company
    })

    res.status(201).json({
        success: true,
        message: "User registered successfully",
        user: toClientUser(user),
    })
})


export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body
    if(!email || !password)
        throw new ApiError(400, "Please provide email and password")

    const user = await User.findOne({ email: email.toLowerCase() }).select("+password")

    if(!user || !(await user.matchPassword(password))){
        throw new ApiError(401, "Invalid email or password")
    }

    res.json({
        success: true,
        message: "User logged in successfully",
        user: toClientUser(user),
    })

})

export const getMe = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        user: toClientUser(req.user),
    })
})

export const updateProfile = asyncHandler(async (req, res) => {
    const { name, avatar, company, password } = req.body
    const user=req.user

    if(name) user.name=name
    if(avatar) user.avatar=avatar
    if(company) user.company=company
    if(password) user.password=password

    await user.save()

    res.json({
        success: true,
        message: "Profile updated successfully",
        user: toClientUser(user),
    })
})