const Venue = require('../models/Venue');
const { success, failure } = require('../utils/response');
const paginate = require('../utils/pagination');

exports.createVenue = async (req, res) => {
  try {
    const venue = await Venue.create(req.body);
    return success(res, venue, "Venue created successfully");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};

exports.getVenues = async (req, res) => {
  try {
    const { page, size, search } = req.body;
    const { skip, limit } = paginate(page, size);

    let filter = { isDeleted: false };
    if (search) {
      filter.venue_name = { $regex: search, $options: "i" };
    }

    const venues = await Venue.find(filter).skip(skip).limit(limit);
    return success(res, venues, "Venues fetched successfully");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};

exports.updateVenue = async (req, res) => {
  try {
    const { venueId, update } = req.body;
    const updated = await Venue.findByIdAndUpdate(venueId, update, { new: true });
    return success(res, updated, "Venue updated successfully");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};

exports.softDeleteVenue = async (req, res) => {
  try {
    const { venueId } = req.body;
    await Venue.findByIdAndUpdate(venueId, { isDeleted: true });
    return success(res, null, "Venue soft deleted");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};

exports.restoreVenue = async (req, res) => {
  try {
    const { venueId } = req.body;
    await Venue.findByIdAndUpdate(venueId, { isDeleted: false });
    return success(res, null, "Venue restored");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};
