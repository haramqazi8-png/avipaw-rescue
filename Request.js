const mongoose = require("mongoose");

const requestSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "Contact",
        "Donation",
        "Adoption"
      ],
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100
    },

    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email address."
      ]
    },

    phone: {
      type: String,
      trim: true,
      maxlength: 30
    },

    donationAmount: {
      type: Number,
      min: 0
    },

    paymentMethod: {
      type: String,
      enum: [
        "Easypaisa",
        "JazzCash",
        "Bank Transfer",
        "Other"
      ]
    },

    animalName: {
      type: String,
      trim: true,
      maxlength: 100
    },

    species: {
      type: String,
      trim: true,
      maxlength: 50
    },

    animalAge: {
      type: Number,
      min: 0,
      max: 100
    },

    animalLocation: {
      type: String,
      trim: true,
      maxlength: 200
    },

    urgency: {
      type: String,
      enum: [
        "Normal",
        "Urgent",
        "Emergency"
      ],
      default: "Normal"
    },

    animalId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Animal"
    },

    housing: {
      type: String,
      trim: true,
      maxlength: 500
    },

    experience: {
      type: String,
      trim: true,
      maxlength: 500
    },

    status: {
      type: String,
      enum: [
        "New",
        "Reviewing",
        "In Progress",
        "Completed",
        "Rejected"
      ],
      default: "New"
    },

    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 1000
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model(
  "Request",
  requestSchema
);