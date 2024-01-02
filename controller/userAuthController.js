const express = require("express");
const app = express();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const JWTService = require("../services/JWTService.js");
const RefreshToken = require("../models/token.js");
const AccessToken = require("../models/accessToken.js");

const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,25}$/;

const userAuthController = {
  async register(req, res, next) {
    const userRegisterSchema = Joi.object({
      fullName: Joi.string().required(),
      email: Joi.string().required(),
      phoneNo: Joi.string(),
      password: Joi.string().pattern(passwordPattern).required(),
    });

    const { error } = userRegisterSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { fullName, email, phoneNo, password } = req.body;

    let accessToken;
    let refreshToken;
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    try {
      const userToRegister = new User({
        fullName,
        email,
        phoneNo,
        password: hashedPassword
      });

      user = await userToRegister.save();

      // token generation
      accessToken = JWTService.signAccessToken({ _id: user._id }, "365d");

      refreshToken = JWTService.signRefreshToken({ _id: user._id }, "365d");
    } catch (error) {
      return next(error);
    }

    // store refresh token in db
    await JWTService.storeRefreshToken(refreshToken, user._id);
    await JWTService.storeAccessToken(accessToken, user._id);

    // 6. response send

    // const userDto = new usertorDto(user);

    return res.status(201).json({ user: user, auth: true, token: accessToken });
  },

  async login(req, res, next) {
    const userLoginSchema = Joi.object({
      email: Joi.string().min(5).max(30).required(),
      password: Joi.string().pattern(passwordPattern),
    });
    const { error } = userLoginSchema.validate(req.body);
    
    if (error) {
        return next(error);
    }
    
    const { email, password } = req.body;
    
    let user;
    
    try {
        // match username
        user = await User.findOne({ email: email });
        console.log(user);
        if (!user) {
            const error = {
          status: 401,
          message: "Invalid email",
        };
        
      }
      
      // match password
      
      const match = await bcrypt.compare(password, user.password);
      console.log("object");

      if (!match) {
        const error = {
          status: 401,
          message: "Invalid Password",
        };

        return next(error);
      }
    } catch (error) {
      return next(error);
    }

    const accessToken = JWTService.signAccessToken({ _id: user._id }, "365d");
    const refreshToken = JWTService.signRefreshToken({ _id: user._id }, "365d");
    // update refresh token in database
    try {
      await RefreshToken.updateOne(
        {
          userId: user._id,
        },
        { token: refreshToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }

    try {
      await AccessToken.updateOne(
        {
          userId: user._id,
        },
        { token: accessToken },
        { upsert: true }
      );
    } catch (error) {
      return next(error);
    }

    return res
      .status(200)
      .json({ user: user, auth: true, token: accessToken });
  },

  async updateProfile(req, res, next) {
    const docSchema = Joi.object({
      userName: Joi.string(),
      email: Joi.string(),
      role: Joi.string(),
      savedRehab: Joi.string(),
      password: Joi.string().pattern(passwordPattern),
    });

    const { error } = docSchema.validate(req.body);

    if (error) {
      return next(error);
    }
    const { userName, email, role, savedRehab, password } = req.body;
    const docId = req.user._id;

    const doc = await User.findById(docId);

    if (!doc) {
      const error = new Error("User not found!");
      error.status = 404;
      return next(error);
    }

    // Update only the provided fields
    if (userName) doc.userName = userName;
    if (email) doc.email = email;
    if (role) doc.role = role;
    if (savedRehab) doc.savedRehab = savedRehab;
    if (password) doc.password = password;

    // Save the updated test
    await doc.save();

    return res
      .status(200)
      .json({ message: "User updated successfully", user: doc });
  },

  async logout(req, res, next) {
    const userId = req.user._id;
    const authHeader = req.headers["authorization"];
    const accessToken = authHeader && authHeader.split(" ")[1];
    try {
      await RefreshToken.deleteOne({ userId });
    } catch (error) {
      return next(error);
    }
    try {
      await AccessToken.deleteOne({ token: accessToken });
    } catch (error) {
      return next(error);
    }

    // 2. response
    res.status(200).json({ user: null, auth: false });
  },
};

module.exports = userAuthController;
