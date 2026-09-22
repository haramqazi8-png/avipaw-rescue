const express = require("express");
const Story = require("../models/Story");

const router = express.Router();

/* GET ALL STORIES */
router.get("/", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (error) {
    console.error("GET STORIES ERROR:", error);
    res.status(500).json({
      message: "Failed to get rescue stories",
      error: error.message,
    });
  }
});

/* GET SINGLE STORY */
router.get("/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    res.status(200).json(story);
  } catch (error) {
    console.error("GET STORY ERROR:", error);

    res.status(400).json({
      message: "Invalid story ID",
    });
  }
});

/* ADD STORY */
router.post("/", async (req, res) => {
  try {
    console.log("STORY DATA RECEIVED:", req.body);

    const {
      title,
      animalName,
      description,
      image,
      date,
    } = req.body;

    if (!title || !animalName || !description) {
      return res.status(400).json({
        message:
          "Title, animal name and description are required",
      });
    }

    const newStory = new Story({
      title: title.trim(),
      animalName: animalName.trim(),
      description: description.trim(),
      image: image || "",
      date: date || "",
    });

    const savedStory = await newStory.save();

    console.log("STORY SAVED:", savedStory);

    res.status(201).json(savedStory);
  } catch (error) {
    console.error("ADD STORY ERROR:", error);

    res.status(500).json({
      message: error.message || "Failed to add story",
    });
  }
});

/* EDIT STORY */
router.put("/:id", async (req, res) => {
  try {
    console.log("UPDATE STORY DATA:", req.body);

    const story = await Story.findById(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    const {
      title,
      animalName,
      description,
      image,
      date,
    } = req.body;

    if (!title || !animalName || !description) {
      return res.status(400).json({
        message:
          "Title, animal name and description are required",
      });
    }

    story.title = title.trim();
    story.animalName = animalName.trim();
    story.description = description.trim();
    story.image = image || "";
    story.date = date || "";

    const updatedStory = await story.save();

    console.log("STORY UPDATED:", updatedStory);

    res.status(200).json(updatedStory);
  } catch (error) {
    console.error("UPDATE STORY ERROR:", error);

    res.status(500).json({
      message: error.message || "Failed to update story",
    });
  }
});

/* DELETE STORY */
router.delete("/:id", async (req, res) => {
  try {
    const story = await Story.findByIdAndDelete(req.params.id);

    if (!story) {
      return res.status(404).json({
        message: "Story not found",
      });
    }

    res.status(200).json({
      message: "Story deleted successfully",
    });
  } catch (error) {
    console.error("DELETE STORY ERROR:", error);

    res.status(500).json({
      message: "Failed to delete story",
    });
  }
});

module.exports = router;