import mongoose from "mongoose"
import bcrypt from "bcryptjs"

const userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true,"Please enter your name"],
        trim:true
    },
    email:{
        type:String,
        required:[true,"Please enter your email"],
        unique:true,
        trim:true,
        lowercase:true,
        match:[/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,"Please enter a valid email address"]
    },
    password:{
        type:String,
        required:[true,"Please enter your password"],
        minlength:[6,"Password must be at least 6 characters long"],
        select:false
    },
    role:{
        type:String,
        enum:["owner","member"],
        default:"owner"
    },
    company:{
        type:String,
        trim:true,
        default:""
    },
    avatar:{
        type:String,
        default:""
    }
},{timestamps:true})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next()
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password,salt)
    next()
})

userSchema.methods.matchPassword = async function(enteredPassword){
    return bcrypt.compare(enteredPassword,this.password)
}

export const User = mongoose.model("User",userSchema)