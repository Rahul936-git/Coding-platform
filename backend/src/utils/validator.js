const validator =require("validator");
const User = require("../models/user");

// req.body 

const validate = async (data)=>{
   
    const mandatoryField = ['firstName',"emailId",'password'];

    const IsAllowed = mandatoryField.every((k)=> Object.keys(data).includes(k));

    if(!IsAllowed)
        throw new Error("Some Field Missing");

    if(!validator.isEmail(data.emailId))
        throw new Error("Invalid Email");

    if(!validator.isStrongPassword(data.password))
        throw new Error("Weak Password");

    const existingUser = await User.findOne({ emailId: data.emailId });
    if(existingUser){
        if(existingUser.provider==="google"){
            throw new Error("Account exists with google. Continue with google");
        }
        throw new Error("Email is already registered");
    }
}

module.exports = validate;