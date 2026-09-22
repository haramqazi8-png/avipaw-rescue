const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("./User");
const { protect, adminOnly } = require("./authMiddleware");

const router = express.Router();

/*
=========================================
GET ALL USERS
GET /api/users
ADMIN ONLY
=========================================
*/

router.get(
  "/",
  protect,
  adminOnly,
  async (req, res, next) => {
    try {
      const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });

      res.status(200).json(users);
    } catch (error) {
      next(error);
    }
  }
);


/*
=========================================
GET ONE USER
GET /api/users/:id
ADMIN ONLY
=========================================
*/

router.get(
  "/:id",
  protect,
  adminOnly,
  async (req, res, next) => {
    try {
      const user = await User.findById(req.params.id)
        .select("-password");

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);


/*
=========================================
CREATE USER
POST /api/users
ADMIN ONLY
=========================================
*/

router.post(
  "/",
  protect,
  adminOnly,
  async (req, res, next) => {
    try {
      const {
        name,
        email,
        password,
        role
      } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          message:
            "Name, email, and password are required"
        });
      }

      if (name.trim().length < 2) {
        return res.status(400).json({
          message:
            "Name must be at least 2 characters"
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters"
        });
      }

      const normalizedEmail =
        email.toLowerCase().trim();

      const existingUser =
        await User.findOne({
          email: normalizedEmail
        });

      if (existingUser) {
        return res.status(400).json({
          message:
            "A user with this email already exists"
        });
      }

      const hashedPassword =
        await bcrypt.hash(password, 10);

      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role || "user"
      });

      res.status(201).json({
        message: "User created successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
=========================================
UPDATE USER
PUT /api/users/:id
ADMIN ONLY
=========================================
*/

router.put(
  "/:id",
  protect,
  adminOnly,
  async (req, res, next) => {
    try {
      const {
        name,
        email,
        password,
        role
      } = req.body;

      const user =
        await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      if (name !== undefined) {
        if (name.trim().length < 2) {
          return res.status(400).json({
            message:
              "Name must be at least 2 characters"
          });
        }

        user.name = name.trim();
      }

      if (email !== undefined) {
        const normalizedEmail =
          email.toLowerCase().trim();

        const existingUser =
          await User.findOne({
            email: normalizedEmail,
            _id: {
              $ne: user._id
            }
          });

        if (existingUser) {
          return res.status(400).json({
            message:
              "A user with this email already exists"
          });
        }

        user.email = normalizedEmail;
      }

      if (password !== undefined && password !== "") {
        if (password.length < 6) {
          return res.status(400).json({
            message:
              "Password must be at least 6 characters"
          });
        }

        user.password =
          await bcrypt.hash(password, 10);
      }

      if (role !== undefined) {
        if (
          role !== "user" &&
          role !== "admin"
        ) {
          return res.status(400).json({
            message:
              "Role must be user or admin"
          });
        }

        user.role = role;
      }

      await user.save();

      res.status(200).json({
        message: "User updated successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        }
      });
    } catch (error) {
      next(error);
    }
  }
);


/*
=========================================
DELETE USER
DELETE /api/users/:id
ADMIN ONLY
=========================================
*/

router.delete(
  "/:id",
  protect,
  adminOnly,
  async (req, res, next) => {
    try {
      const user =
        await User.findById(req.params.id);

      if (!user) {
        return res.status(404).json({
          message: "User not found"
        });
      }

      /*
        Prevent admin from deleting
        their own currently logged-in account.
      */

      if (
        user._id.toString() ===
        req.user.userId.toString()
      ) {
        return res.status(400).json({
          message:
            "You cannot delete your own admin account"
        });
      }

      await user.deleteOne();

      res.status(200).json({
        message: "User deleted successfully",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      next(error);
    }
  }
);


module.exports = router;
