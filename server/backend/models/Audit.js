const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  action: { 
    type: String, 
    enum: ['create', 'update', 'delete', 'restore'], 
    required: true 
  },
  entity: { 
    type: String, 
    enum: ['user', 'venue', 'bookmark'], 
    required: true 
  },
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
