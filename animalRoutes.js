const express = require("express");
const mongoose = require("mongoose");
const Animal = require("./Animal");
const {
  protect,
  adminOnly
} = require("./authMiddleware");

const router = express.Router();

/* =========================================================
   GET ALL ANIMALS
   Public — supports ?search= ?species= ?status=
========================================================= */

router.get("/", async (req, res) => {
  try {
    const { search, species, status } = req.query;

    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { species: { $regex: search, $options: "i" } }
      ];
    }

    if (species) {
      filter.species = {
        $regex: species,
        $options: "i"
      };
    }

    if (status) {
      filter.status = {
        $regex: status,
        $options: "i"
      };
    }

    const animals = await Animal.find(filter).sort({
      createdAt: -1
    });

    res.status(200).json(animals);
  } catch (error) {
    console.error("GET ANIMALS ERROR:", error);

    res.status(500).json({
      message: "Failed to get animals"
    });
  }
});

/* =========================================================
   GET MY ANIMALS
   Private — returns only animals created by logged-in user
========================================================= */

router.get("/mine", protect, async (req, res) => {
  try {
    const animals = await Animal.find({
      createdBy: req.user.userId
    }).sort({ createdAt: -1 });

    res.status(200).json(animals);
  } catch (error) {
    console.error("GET MY ANIMALS ERROR:", error);

    res.status(500).json({
      message: "Failed to get your animals"
    });
  }
});

/* =========================================================
   GET SINGLE ANIMAL
   Public
========================================================= */

router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid animal ID"
      });
    }

    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found"
      });
    }

    res.status(200).json(animal);
  } catch (error) {
    console.error("GET ANIMAL ERROR:", error);

    res.status(500).json({
      message: "Failed to get animal"
    });
  }
});

/* =========================================================
   CREATE ANIMAL
   Private — any logged-in user
========================================================= */

router.post("/", protect, async (req, res) => {
  try {
    const {
      name,
      species,
      age,
      gender,
      status,
      description,
      image
    } = req.body;

    if (!name || !species || !status) {
      return res.status(400).json({
        message: "Name, species and status are required"
      });
    }

    const animal = new Animal({
      name: name.trim(),
      species,
      age: age !== undefined && age !== "" ? Number(age) : 0,
      gender: gender || "Male",
      status,
      description: description || "",
      image: image || "",
      createdBy: req.user.userId
    });

    const savedAnimal = await animal.save();

    res.status(201).json(savedAnimal);
  } catch (error) {
    console.error("CREATE ANIMAL ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", ")
      });
    }

    res.status(500).json({
      message: error.message || "Failed to create animal"
    });
  }
});

/* =========================================================
   UPDATE ANIMAL
   Private — owner OR admin
========================================================= */

router.put("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid animal ID"
      });
    }

    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found"
      });
    }

    const isOwner =
      animal.createdBy &&
      animal.createdBy.toString() === req.user.userId.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You can only edit your own animals"
      });
    }

    const {
      name,
      species,
      age,
      gender,
      status,
      description,
      image
    } = req.body;

    if (name !== undefined) animal.name = name.trim();
    if (species !== undefined) animal.species = species;
    if (age !== undefined) animal.age = age === "" ? 0 : Number(age);
    if (gender !== undefined) animal.gender = gender;
    if (status !== undefined) animal.status = status;
    if (description !== undefined) animal.description = description;
    if (image !== undefined) animal.image = image;

    const updatedAnimal = await animal.save();

    res.status(200).json(updatedAnimal);
  } catch (error) {
    console.error("UPDATE ANIMAL ERROR:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(error.errors)
          .map((e) => e.message)
          .join(", ")
      });
    }

    res.status(500).json({
      message: error.message || "Failed to update animal"
    });
  }
});

/* =========================================================
   DELETE ANIMAL
   Private — owner OR admin
========================================================= */

router.delete("/:id", protect, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        message: "Invalid animal ID"
      });
    }

    const animal = await Animal.findById(req.params.id);

    if (!animal) {
      return res.status(404).json({
        message: "Animal not found"
      });
    }

    const isOwner =
      animal.createdBy &&
      animal.createdBy.toString() === req.user.userId.toString();

    const isAdmin = req.user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "You can only delete your own animals"
      });
    }

    await animal.deleteOne();

    res.status(200).json({
      message: "Animal deleted successfully"
    });
  } catch (error) {
    console.error("DELETE ANIMAL ERROR:", error);

    res.status(500).json({
      message: "Failed to delete animal"
    });
  }
});

module.exports = router;
