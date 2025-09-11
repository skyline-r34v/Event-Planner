
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const fs = require("fs");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
app.use(express.json());
app.use(cors());

// -------------------- ENV VARIABLES --------------------
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;
const SCRAPER_PATH = process.env.SCRAPER_PATH || "./scraper.py";
const PYTHON_PATH = process.env.PYTHON_PATH || "python3";

// -------------------- DATABASE --------------------
mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
    process.exit(1);
  });

// -------------------- SCHEMA --------------------
const venueSchema = new mongoose.Schema(
  {
    venue_name: String,
    city: String,
    url: String,
    rating: Number,
    reviews: Number,
    location: String,
    venue_type: String,
    capacity: Number,
    veg_plate_price: Number,
    non_veg_plate_price: Number,
    rooms: Number,
    about: String,
    images: [String],
  },
  { timestamps: true }
);

const Venue = mongoose.model("Venue", venueSchema);

// -------------------- HELPERS --------------------
function parseNumberFromText(text) {
  if (!text) return null;
  const cleaned = text.replace(/[^\d]/g, "");
  return cleaned ? parseInt(cleaned, 10) : null;
}

function preprocessVenue(raw) {
  return {
    ...raw,
    rating: parseFloat(raw.rating) || null,
    reviews: parseNumberFromText(raw.reviews),
    capacity: parseNumberFromText(raw.capacity),
    veg_plate_price: parseNumberFromText(raw.veg_plate_price),
    non_veg_plate_price: parseNumberFromText(raw.non_veg_plate_price),
    rooms: parseNumberFromText(raw.rooms),
  };
}

// -------------------- CRUD ROUTES --------------------

// GET all venues
app.get("/venues", async (req, res) => {
  try {
    const venues = await Venue.find();
    res.json(venues);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single venue
app.get("/venues/:id", async (req, res) => {
  try {
    const venue = await Venue.findById(req.params.id);
    if (!venue) return res.status(404).json({ error: "Venue not found" });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE new venue
app.post("/venues", async (req, res) => {
  try {
    const venue = new Venue(preprocessVenue(req.body));
    await venue.save();
    res.status(201).json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE venue
app.put("/venues/:id", async (req, res) => {
  try {
    const venue = await Venue.findByIdAndUpdate(
      req.params.id,
      preprocessVenue(req.body),
      { new: true }
    );
    if (!venue) return res.status(404).json({ error: "Venue not found" });
    res.json(venue);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE venue
app.delete("/venues/:id", async (req, res) => {
  try {
    const venue = await Venue.findByIdAndDelete(req.params.id);
    if (!venue) return res.status(404).json({ error: "Venue not found" });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- IMPORT ROUTE --------------------
app.post("/import", async (req, res) => {
  try {
    const raw = JSON.parse(fs.readFileSync("wedding_venues.json", "utf8"));
    const processed = raw.map(preprocessVenue);

    await Venue.insertMany(processed, { ordered: false });
    res.json({ success: true, count: processed.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// -------------------- SCRAPER TRIGGER --------------------
app.post("/scrape", (req, res) => {
  const cmd = `${PYTHON_PATH} ${SCRAPER_PATH}`;
  console.log(`⚡ Running scraper: ${cmd}`);
  exec(cmd, { cwd: process.cwd() }, (error, stdout, stderr) => {
    if (error) return res.status(500).json({ error: error.message, stderr });
    res.json({ success: true, stdout });
  });
});

// Recommendation

app.post("/recommend", async (req, res) => {
  try {
    const { vegGuests, nonVegGuests, location, budget } = req.body;
    const totalGuests = (vegGuests || 0) + (nonVegGuests || 0);

    const query = {};
    if (location) {
      query.$or = [
        { city: new RegExp(location, "i") },
        { location: new RegExp(location, "i") }
      ];
    }

    const venues = await Venue.find(query);

    const recommendations = venues.map(v => {
      const totalVegPrice = v.veg_plate_price ? v.veg_plate_price * (vegGuests || 0) : 0;
      const totalNonVegPrice = v.non_veg_plate_price ? v.non_veg_plate_price * (nonVegGuests || 0) : 0;
      const totalPrice = totalVegPrice + totalNonVegPrice;

      const pros = [];
      const cons = [];

      // Capacity
      if (v.capacity && v.capacity >= totalGuests) {
        pros.push(`Capacity supports ${totalGuests} guests`);
      } else {
        cons.push(`Might not fit all ${totalGuests} guests`);
      }

      // Rooms
      if (v.rooms && v.rooms > 0) {
        pros.push("Has rooms for guests");
      } else {
        cons.push("No rooms available");
      }

      // Rating
      if (v.rating && v.rating >= 4) {
        pros.push("Highly rated venue");
      } else if (v.rating) {
        cons.push("Average/low rating");
      }

      // Budget check
      if (budget) {
        if (totalPrice <= budget) {
          pros.push(`Total price (${totalPrice}) is within budget`);
        } else {
          cons.push(`Total price (${totalPrice}) exceeds budget`);
        }
      }

      return {
        ...v.toObject(),
        vegGuests,
        nonVegGuests,
        totalGuests,
        totalVegPrice,
        totalNonVegPrice,
        totalPrice,
        pros,
        cons
      };
    });

    // Filter venues that at least have some capacity for guests
    const filtered = recommendations.filter(v => v.capacity >= totalGuests);

    // Sort by closest to budget first, then by rating
    filtered.sort((a, b) => {
      if (budget) {
        const diffA = Math.abs(budget - a.totalPrice);
        const diffB = Math.abs(budget - b.totalPrice);
        if (diffA !== diffB) return diffA - diffB;
      }
      return (b.rating || 0) - (a.rating || 0);
    });

    res.json({ count: filtered.length, recommendations: filtered });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// -------------------- START SERVER --------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
