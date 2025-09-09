const AuditLog = require('../models/Audit');
const { success, failure } = require('../utils/response');
const paginate = require('../utils/pagination');

exports.getLogs = async (req, res) => {
  try {
    const { page, size } = req.body;
    const { skip, limit } = paginate(page, size);

    const logs = await AuditLog.find().populate('performedBy').skip(skip).limit(limit);
    return success(res, logs, "Audit logs fetched");
  } catch (err) {
    return failure(res, err.message, 500);
  }
};
