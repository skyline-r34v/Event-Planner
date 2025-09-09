const mongoose = require('mongoose');

const venueSchema = new mongoose.Schema({
  venue_name: { type: String, required: true },
  url: { type: String },
  rating: { type: Number },
  reviews: { type: String },
  location: { type: String },
  venue_type: { type: String },
  capacity: {
    min: { type: Number },
    max: { type: Number }
  },
  veg_plate_price: { type: Number },
  non_veg_plate_price: { type: Number },
  rooms: { type: String },
  about: { type: String },
  images: [{ type: String }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Venue', venueSchema);
