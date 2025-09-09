const Bookmark = require('../models/Bookmark');
const { success, failure } = require('../utils/response');
const paginate = require('../utils/pagination');

exports.addBookmark = async (req, res) => {
  try {
    const { venueId } = req.body;
    const bookmark = await Bookmark.create({ userId: req.user.id, venueId });
    return success(res, bookmark, "Bookmark added");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};

exports.getBookmarks = async (req, res) => {
  try {
    const { page, size } = req.body;
    const { skip, limit } = paginate(page, size);

    const bookmarks = await Bookmark.find({ userId: req.user.id, isDeleted: false })
      .populate('venueId')
      .skip(skip).limit(limit);

    return success(res, bookmarks, "Bookmarks fetched");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};

exports.softDeleteBookmark = async (req, res) => {
  try {
    const { bookmarkId } = req.body;
    await Bookmark.findByIdAndUpdate(bookmarkId, { isDeleted: true });
    return success(res, null, "Bookmark soft deleted");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};

exports.restoreBookmark = async (req, res) => {
  try {
    const { bookmarkId } = req.body;
    await Bookmark.findByIdAndUpdate(bookmarkId, { isDeleted: false });
    return success(res, null, "Bookmark restored");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};
