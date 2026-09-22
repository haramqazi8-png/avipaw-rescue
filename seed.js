const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Animal = require("./models/Animal");

dotenv.config();

const animals = [
  {
    name: "Buddy",
    species: "Dog",
    age: 3,
    gender: "Male",
    status: "Available",
    description: "Buddy is a friendly and playful dog who loves people and enjoys spending time with his rescuers.",
    image: "https://images.unsplash.com/photo-1709788938324-889c6171e718?auto=format&fit=crop&w=900&q=90"
  },
  {
    name: "Luna",
    species: "Cat",
    age: 2,
    gender: "Female",
    status: "Available",
    description: "Luna is a sweet and loving cat who enjoys gentle attention and would make a wonderful companion.",
    image: "https://images.unsplash.com/photo-1784058793086-0ef15cf76237?auto=format&fit=crop&w=900&q=90"
  },
  {
    name: "Milo",
    species: "Dog",
    age: 4,
    gender: "Male",
    status: "Under Treatment",
    description: "Milo is recovering with veterinary care, nutritious food, medicine, and plenty of rest.",
    image: "https://images.unsplash.com/photo-1657727262722-87883addc443?auto=format&fit=crop&w=900&q=90"
  },
  {
    name: "Hope",
    species: "Dog",
    age: 5,
    gender: "Female",
    status: "Available",
    description: "Hope is a gentle rescue dog who has recovered and is now looking for a safe forever home.",
    image: "https://images.unsplash.com/photo-1781195693659-fd725cea602b?auto=format&fit=crop&w=900&q=90"
  },
  {
    name: "Charlie",
    species: "Cat",
    age: 1,
    gender: "Male",
    status: "Available",
    description: "Charlie is a young and curious cat who is ready to meet a caring and responsible family.",
    image: "https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=900&q=90"
  },
  {
    name: "Bella",
    species: "Cat",
    age: 2,
    gender: "Female",
    status: "Adopted",
    description: "Bella has found a loving forever home after receiving care and support from Avipaw Rescue.",
    image: "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=90"
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB connected");

    await Animal.deleteMany();

    await Animal.insertMany(animals);

    console.log("6 animals added successfully");

    await mongoose.connection.close();

    console.log("Database connection closed");
  } catch (error) {
    console.error("Seed error:", error.message);
    process.exit(1);
  }
};

seedDatabase();