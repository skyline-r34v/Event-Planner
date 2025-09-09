const paginate = (page = 1, size = 10) => {
  const limit = parseInt(size);
  const skip = (parseInt(page) - 1) * limit;
  return { skip, limit };
};

module.exports = paginate;
