var mongoose=require("mongoose")

var AdminSchema=new mongoose.Schema({
    name:{
        type:String
    },
    email:{
        type:String
    },
    password:{
        type:String
    },
    otp:{
        type:String
    },
    otpExpiration: {
        type: Date,
    }
})

module.exports=mongoose.model("admin",AdminSchema)