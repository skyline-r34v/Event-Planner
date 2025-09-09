const success = (res, data, message = "Success") => {
  return res.json({ success: true, message, data });
};

const failure = (res, message = "Failed", status = 400) => {
  return res.status(status).json({ success: false, message });
};

module.exports = { success, failure };
