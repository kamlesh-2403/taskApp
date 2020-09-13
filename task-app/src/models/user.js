const validator = require('validator')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true
    },
    email:{ 
        type:String,
        required: true,
        unique:true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('email is invalid')
            }
        }
    },
    password: { 
        type:String,
        required: true,
        trim: true,
        minLength: 7,
        validate(value){
            if(value.includes==="password"){
                throw new Error('password contains password')
            }
        }
    },
    tokens: [{
        token:{
            type:String,
            required:true
        }
    }],
    avatar: {
        type:Buffer
    }
},{
    timestamps:true
})

userSchema.virtual('tasks',{
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
})

// to privatize the data and only share public data
userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject

}

userSchema.methods.generateAuthToken = async function(){
    const user = this 
    const token = jwt.sign({_id:user._id.toString()},process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({token:token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async(email, password)=>{
    const user = await User.findOne({ email })
    if(!user){
        throw new Error("Invalid email id")
    }
    const isMatch = await bcrypt.compare(password,user.password)

    if(!isMatch){
        throw new Error("invalid password")
    }
    return user

}

// using middleware
userSchema.pre('save',async function(next){
    const user = this 

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password,8)
    }
    next()
})

userSchema.pre('remove',async function(next){
    const user = this
    await Task.deleteMany({owner:user._id})
    next()
})

const User = mongoose.model('users',userSchema)

module.exports = User