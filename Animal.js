const mongoose = require("mongoose");

const animalSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Animal name is required"],
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
      trim: true
    },

    species: {
      type: String,
      required: [true, "Species is required"],
      enum: {
        values: ["Dog", "Cat", "Bird", "Rabbit", "Other"],
        message: "Please select a valid species"
      }
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [0, "Age cannot be negative"],
      max: [30, "Age cannot exceed 30"]
    },

    gender: {
      type: String,
      required: [true, "Gender is required"],
      enum: {
        values: ["Male", "Female"],
        message: "Please select a valid gender"
      }
    },

    status: {
      type: String,
      required: [true, "Status is required"],
      enum: {
        values: ["Available", "Under Treatment", "Adopted"],
        message: "Please select a valid status"
      },
      default: "Available"
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      minlength: [10, "Description must be at least 10 characters"],
      maxlength: [500, "Description cannot exceed 500 characters"],
      trim: true
    },

    image: {
      type: String,
      required: [true, "Image URL is required"],
      trim: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [false, "Animal owner is required"]
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Animal", animalSchema);
