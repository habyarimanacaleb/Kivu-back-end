const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "../.env") });

const Blog = require("../models/Blog"); 

const initialBlogs = [
  {
    title: "The Physics of the Kivu Trail: Gear Ratio & Verticals",
    slug: "physics-of-kivu-trail-gear-ratio-verticals",
    excerpt: "Exploring why a 44:1 gear ratio is the mechanical sweet spot for our Congo Nile Cycling Package.", // Required Field
    content: "Deep dive into the mechanical stresses of high-altitude cycling on our premier Congo Nile Trail tour package. When navigating the steep ascents along the shores of Lake Kivu, torque management becomes paramount. Our fleet uses custom-ratio drivetrains to match structural frame geometry with human cadence windows...",
    author: "Caleb H.",
    category: "Technical",
    tags: ["Congo Nile Trail", "Gear Ratio", "Biking", "Engineering"],
    mainImage: "https://images.singletracks.com/blog/wp-content/uploads/2022/10/0O8A1766-scaled.jpg", // Required Field
    gallery: [
      "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1541625602330-2277a1cd13a1?auto=format&fit=crop&q=80&w=800",
    ],
    likes: [],
    comments: []
  },
  {
    title: "Midnight on Lake Kivu: A Fisherman's Perspective",
    slug: "midnight-on-lake-kivu-fishermen-perspective",
    excerpt: "How the rhythmic lights of the Sambaza fishing boats guide our exclusive Night-Water Excursion Package.", // Required Field
    content: "The lights of Lake Kivu are more than just a tradition; they are a living navigation system for our Night-Water Night Cruise package. Travelers join local fishermen in traditional three-hulled canoes, learning the ancient rhythmic songs and engineering techniques used to harvest Sambaza sardines beneath a star-filled sky...",
    author: "Caleb H.",
    category: "Culture",
    tags: ["Lake Kivu", "Night Fishing", "Culture", "Tradition"],
    mainImage: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&q=80&w=2000", // Required Field
    gallery: [
      "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1534329535363-5fa5ca726cd5?auto=format&fit=crop&q=80&w=800",
    ],
    likes: [],
    comments: []
  },
  {
    title: "Explore the Perfect Expedition Bike Fleet",
    slug: "explore-perfect-expedition-bike-fleet",
    excerpt: "A breakdown of the frame geometry and rugged modifications built into our Rwanda Multi-Day Tour package fleet.", // Required Field
    content: "Using professional CAD tools, we optimized the stress-bearing points of our rental fleet frames to ensure maximum safety and durability on rocky descents. This ensures that every rider booking our multi-day custom expeditions experiences absolute mechanical reliability across Rwanda's thousands of hills...",
    author: "Caleb H.",
    category: "Technical",
    tags: ["CAD", "Fleet Management", "Biking", "Design"],
    mainImage: "https://images.unsplash.com/photo-1475666675596-cca2035b3d79?auto=format&fit=crop&q=80&w=2000", // Required Field
    gallery: [
      "https://images.unsplash.com/photo-1571333250630-f0230c320b6d?auto=format&fit=crop&q=80&w=800",
      "https://images.unsplash.com/photo-1502744688674-c619d3586721?auto=format&fit=crop&q=80&w=800",
    ],
    likes: [],
    comments: []
  },
  {
    title: "The Geology of the Kivu Highlands",
    slug: "geology-of-kivu-highlands",
    excerpt: "How the volcanic origins of the Kivu Highlands shape the terrain and biodiversity of our Congo Nile Trail tour package.", // Required Field
    content: "The Kivu Highlands are a geological marvel formed by ancient volcanic activity, creating a unique landscape that defines our Congo Nile Trail tour. The rugged terrain, rich in minerals, supports a diverse ecosystem that travelers can explore while biking through lush forests and along dramatic cliffs overlooking Lake Kivu...",
    author: "Caleb H.",
    category: "Geology",
    tags: ["Geology", "Kivu Highlands", "Volcanic Activity", "Biodiversity"],
    mainImage: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2000",
    gallery: [
      "https://images.unsplash.com/photo-1534329535363-5fa5ca726cd5?auto=format&fit=crop&q=80&w=800"
    ],
    likes: [],
    comments: []
  }
];

const seedDatabase = async () => {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("Missing MONGO_URI in environment configuration variables.");
    }

    console.log("Connecting to MongoDB Atlas Cluster...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Database connection established.");

    console.log("Clearing existing blog indices...");
    await Blog.deleteMany();

    console.log("Inserting production-ready articles matrix...");
    await Blog.insertMany(initialBlogs);

    console.log("🎉 Database seeded successfully with production content!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding database aborted due to fault:", error.message);
    process.exit(1);
  }
};

seedDatabase();