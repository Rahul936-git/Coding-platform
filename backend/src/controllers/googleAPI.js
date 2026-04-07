const User = require("../models/user");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const googleFetch = async (req, res) => {
  try{

    if (!req.user) {
      return res.status(400).json({ message: "Google auth failed" });
    }

    const user = {
    id: req.user.id,
    name: req.user.displayName,
    email: req.user.emails[0].value
  };

  let user_info = await User.findOne({ emailId: user.email });

  if (!user_info) {
    let user_infos = {
      firstName: user.name,
      emailId: user.email,
      role: "user",
      googleID: user.id,
      provider: "google"
    };
    user_info = await User.create(user_infos);
    const payload = {
      _id: user_info._id,
      firstName: user_info.firstName,
      role: user_info.role,
      emailId: user_info.emailId,
    };
    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: 7200 });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });

    return res.redirect(process.env.CLIENT_URL);
  }

  if(user_info && user_info.provider==="local"){
    user_info = await User.findByIdAndUpdate(user_info._id,{
      provider: "both",
      googleID: user.id
    },{
      new: true,
      runValidators: true
    })
  }

  const payload = {
    _id: user_info._id,
    firstName: user_info.firstName,
    role: user_info.role,
    emailId: user_info.emailId,
  };

    const token = jwt.sign(payload, process.env.JWT_KEY, { expiresIn: 7200 });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      path: "/"
    });

    res.redirect(process.env.CLIENT_URL);
  }

  catch (err) {
  console.error(err);
  res.status(500).json({ message: "OAuth failed" });
}

};

module.exports = googleFetch;
