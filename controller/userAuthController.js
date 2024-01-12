const express = require("express");
const app = express();
const Joi = require("joi");
const bcrypt = require("bcryptjs");
const User = require("../models/user.js");
const JWTService = require("../services/JWTService.js");
const RefreshToken = require("../models/token.js");
const AccessToken = require("../models/accessToken.js");

const passwordPattern =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;

const userAuthController = {
  async register(req, res, next) {
    const userRegisterSchema = Joi.object({
      name: Joi.string().required(),
      email: Joi.string().required(),
      phone: Joi.string().required(),
      password: Joi.string().pattern(passwordPattern).required(),
    });

    const { error } = userRegisterSchema.validate(req.body);

    if (error) {
      return next(error);
    }

    const { name, email, phone, password } = req.body;
    const emailExists = await User.findOne({ email });
    console.log(emailExists);
    if (emailExists) {
      const error = {
        status: 401,
        message: "Email Already Registered",
      };

      return next(error);
    }

    let accessToken;
    let refreshToken;
    const hashedPassword = await bcrypt.hash(password, 10);

    let user;
    try {
      const userToRegister = new User({
        name,
        email,
        phone,
        password: hashedPassword,
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

    return res.status(200).json({ user: user, auth: true, token: accessToken });
  },

  async completeProfile(req, res, next) {
    try {
      const userSchema = Joi.object({
        gender: Joi.string().valid("male", "female").required(),
        DOB: Joi.string().required(),
        userId: Joi.string().required(),
        occupation: Joi.string().required(),
        employedIn: Joi.string().required(),
        annualIncome: Joi.number().required(),
        workLocation: Joi.string().required(),
        age: Joi.number().required(),
        maritalStatus: Joi.string().required(),
        height: Joi.string().required(),
        motherTongue: Joi.string().required(),
        sect: Joi.string().required(),
        city: Joi.string().required(),
        highestDegree: Joi.string().required(),
        partnerPreference: Joi.object({
          partnerAge: Joi.string().required(),
          partnerMaritalStatus: Joi.string().required(),
          partnerHeight: Joi.number().required(),
          education: Joi.string().required(),
          partnerOccupation: Joi.string().required(),
          partnerMotherTongue: Joi.string().required(),
          partnerAnnualIncome: Joi.string().required(),
          partnerSect: Joi.string().required(),
          partnerCity: Joi.string().required(),
        }),
      });

      const { error } = userSchema.validate(req.body);

      if (error) {
        return next(error);
      }

      const userId = req.body.userId;

      try {
        const user = await User.findByIdAndUpdate(
          userId,
          { $set: req.body },
          { new: true }
        );

        if (!user) {
          const error = new Error("User not found!");
          error.status = 404;
          return next(error);
        }
        user.profileCompleted = true;
        await user.save();
        return res
          .status(200)
          .json({ message: "User updated successfully", user });
      } catch (error) {
        return next(error);
      }
    } catch (error) {
      return next(error);
    }
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
