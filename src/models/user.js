const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./task')
const userSchema =new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        required:true
    },email:{
        type:String,
        unique:true,
        trim:true,
        required:true,
        lowercase:true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('invalid email')
            }
        }
    },age:{
        type:Number,
        default:0,
        validate(value){
            if(value < 0)
                throw new Error('Age cannot be negative')
        }
    },password:{
        type:String,
        required:true,
        trim:true,
        minlength:6,
        validate(value){
            if(value.includes('password'))
                throw new Error('password should no contain "password"')
        }
    },tokens:[{
        token:{
            type:String,
            required:true
        }
    }]
},{
    timestamps:true
})

//creating virtual field to establish the relation between user and task
//it will not be established in the database
userSchema.virtual('myTask',{
    ref:'Task',             //refrence to the task model
    localField:'_id',       //user id is realted to the owner of the task
    foreignField:'owner'    //foreign field of the task app which binds the user and task app
})


//creating what data should be visible to the client
//toJSON method is used to manipulate the data
userSchema.methods.toJSON = function(){
    const user = this
    
    const userObject = user.toObject()//changing user to object 
    
    delete userObject.tokens
    delete userObject.password

    return userObject
}

//it is used to create methods on instances not on models(User) also called instance method
userSchema.methods.generateAuthToken = async function(){
    const user = this

    const token = jwt.sign({_id:user._id},process.env.TOKEN_SECRET)
    user.tokens = user.tokens.concat({ token })

    await user.save()

    return token
}

//creating your own custom function, it is accesible on model also called model function 
userSchema.statics.findByCredentials= async (email, password) => {
    const user = await User.findOne({ email:email })

    if(!user)
        throw new Error('unable to login')
    
    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch)
        throw new Error('unable to login')

    return user
}

//hashing the password before saving it to database
userSchema.pre('save', async function (next){
    const user = this

    //if password is modified then only hash the password 
    if(user.isModified('password'))
        user.password = await bcrypt.hash(user.password,10)

    next()
})

//removing all the tasks which the user created
userSchema.pre('remove', async function(next){
    const user = this

    await Task.deleteMany({owner:user._id})

    next()
})

const User = mongoose.model('User',userSchema)

module.exports = User