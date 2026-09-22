const express = require("express");
const mongoose = require("mongoose");

const Request = require("./Request");
const Animal = require("./Animal");

const {
  protect,
  adminOnly
} = require("./authMiddleware");

const router = express.Router();

/* =========================================================
   CREATE REQUEST
   PUBLIC
========================================================= */

router.post("/", async (req, res) => {
  try {
    const {
      type,
      name,
      email,
      phone,
      donationAmount,
      paymentMethod,
      animalName,
      species,
      animalAge,
      animalLocation,
      urgency,
      animalId,
      housing,
      experience,
      message
    } = req.body;

    if (!type) {
      return res.status(400).json({
        message: "Request type is required."
      });
    }

    if (
      ![
        "Contact",
        "Donation",
        "Adoption"
      ].includes(type)
    ) {
      return res.status(400).json({
        message: "Invalid request type."
      });
    }

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Name is required."
      });
    }

    if (!email || !email.trim()) {
      return res.status(400).json({
        message: "Email is required."
      });
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({
        message: "Please enter a valid email address."
      });
    }

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message is required."
      });
    }

    if (
      type === "Donation" &&
      (
        donationAmount === undefined ||
        donationAmount === null ||
        Number(donationAmount) <= 0
      )
    ) {
      return res.status(400).json({
        message: "A valid donation amount is required."
      });
    }

    let selectedAnimal = null;

    if (type === "Adoption") {
      if (!animalId) {
        return res.status(400).json({
          message: "Please select an animal for adoption."
        });
      }

      if (!mongoose.Types.ObjectId.isValid(animalId)) {
        return res.status(400).json({
          message: "Invalid animal ID."
        });
      }

      selectedAnimal = await Animal.findById(animalId);

      if (!selectedAnimal) {
        return res.status(404).json({
          message: "Selected animal was not found."
        });
      }

      if (selectedAnimal.status !== "Available") {
        return res.status(400).json({
          message:
            "This animal is no longer available for adoption."
        });
      }
    }

    const request = await Request.create({
      type,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone ? phone.trim() : "",

      donationAmount:
        donationAmount !== undefined &&
        donationAmount !== ""
          ? Number(donationAmount)
          : undefined,

      paymentMethod:
        paymentMethod || undefined,

      animalName:
        selectedAnimal?.name ||
        animalName ||
        "",

      species:
        selectedAnimal?.species ||
        species ||
        "",

      animalAge:
        selectedAnimal?.age ??
        animalAge,

      animalLocation:
        animalLocation || "",

      urgency:
        urgency || "Normal",

      animalId:
        animalId || undefined,

      housing:
        housing || "",

      experience:
        experience || "",

      message: message.trim(),

      status: "New"
    });

    return res.status(201).json({
      message: "Request submitted successfully.",
      request
    });

  } catch (error) {
    console.error(
      "Create request error:",
      error
    );

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((item) => item.message)
          .join(", ")
      });
    }

    return res.status(500).json({
      message: "Unable to submit request."
    });
  }
});

/* =========================================================
   GET ALL REQUESTS
   ADMIN ONLY
========================================================= */

router.get(
  "/",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const {
        search = "",
        type = "",
        status = ""
      } = req.query;

      const filter = {};

      if (type) {
        filter.type = type;
      }

      if (status) {
        filter.status = status;
      }

      if (search.trim()) {
        const searchRegex =
          new RegExp(search.trim(), "i");

        filter.$or = [
          { name: searchRegex },
          { email: searchRegex },
          { phone: searchRegex },
          { animalName: searchRegex },
          { species: searchRegex },
          { message: searchRegex }
        ];
      }

      const requests = await Request.find(filter)
        .populate(
          "animalId",
          "name species age status image"
        )
        .sort({
          createdAt: -1
        });

      return res.status(200).json(
        requests
      );

    } catch (error) {
      console.error(
        "Get requests error:",
        error
      );

      return res.status(500).json({
        message: "Unable to load requests."
      });
    }
  }
);

/* =========================================================
   GET SINGLE REQUEST
   ADMIN ONLY
========================================================= */

router.get(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid request ID."
        });
      }

      const request =
        await Request.findById(id)
          .populate(
            "animalId",
            "name species age status image"
          );

      if (!request) {
        return res.status(404).json({
          message: "Request not found."
        });
      }

      return res.status(200).json(
        request
      );

    } catch (error) {
      console.error(
        "Get request error:",
        error
      );

      return res.status(500).json({
        message: "Unable to load request."
      });
    }
  }
);

/* =========================================================
   UPDATE REQUEST
   ADMIN ONLY
========================================================= */

router.put(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid request ID."
        });
      }

      const allowedFields = [
        "status",
        "name",
        "email",
        "phone",
        "donationAmount",
        "paymentMethod",
        "animalName",
        "species",
        "animalAge",
        "animalLocation",
        "urgency",
        "animalId",
        "housing",
        "experience",
        "message"
      ];

      const updates = {};

      for (const field of allowedFields) {
        if (
          Object.prototype.hasOwnProperty.call(
            req.body,
            field
          )
        ) {
          updates[field] = req.body[field];
        }
      }

      if (
        updates.status &&
        ![
          "New",
          "Reviewing",
          "In Progress",
          "Completed",
          "Rejected"
        ].includes(updates.status)
      ) {
        return res.status(400).json({
          message: "Invalid request status."
        });
      }

      if (
        updates.email &&
        !/^\S+@\S+\.\S+$/.test(
          String(updates.email).trim()
        )
      ) {
        return res.status(400).json({
          message: "Invalid email address."
        });
      }

      const request =
        await Request.findByIdAndUpdate(
          id,
          updates,
          {
            new: true,
            runValidators: true
          }
        ).populate(
          "animalId",
          "name species age status image"
        );

      if (!request) {
        return res.status(404).json({
          message: "Request not found."
        });
      }

      return res.status(200).json({
        message:
          "Request updated successfully.",
        request
      });

    } catch (error) {
      console.error(
        "Update request error:",
        error
      );

      if (error.name === "ValidationError") {
        return res.status(400).json({
          message: Object.values(
            error.errors
          )
            .map(
              (item) => item.message
            )
            .join(", ")
        });
      }

      return res.status(500).json({
        message: "Unable to update request."
      });
    }
  }
);

/* =========================================================
   DELETE REQUEST
   ADMIN ONLY
========================================================= */

router.delete(
  "/:id",
  protect,
  adminOnly,
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({
          message: "Invalid request ID."
        });
      }

      const request =
        await Request.findByIdAndDelete(id);

      if (!request) {
        return res.status(404).json({
          message: "Request not found."
        });
      }

      return res.status(200).json({
        message:
          "Request deleted successfully."
      });

    } catch (error) {
      console.error(
        "Delete request error:",
        error
      );

      return res.status(500).json({
        message: "Unable to delete request."
      });
    }
  }
);

module.exports = router;
