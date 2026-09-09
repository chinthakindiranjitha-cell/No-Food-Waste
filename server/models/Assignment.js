import mongoose from 'mongoose';

const stopStatusSchema = new mongoose.Schema({
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodRequest', required: true },
  status: {
    type: String,
    enum: ['assigned', 'collected', 'delivered'],
    default: 'assigned'
  }
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  // Single-request assignment (legacy / normal flow) — optional when isBatch=true
  requestId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodRequest', default: null },

  // Batch assignment — multiple request stops
  requestIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodRequest' }],

  // Per-stop status tracking for batch assignments
  stopStatuses: [stopStatusSchema],

  // Flag distinguishing batch vs single
  isBatch: { type: Boolean, default: false },

  volunteerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['assigned', 'collected', 'delivered'], default: 'assigned' },
}, { timestamps: true });

// Validation: must have either requestId or at least one requestId in requestIds
assignmentSchema.pre('save', function (next) {
  if (!this.requestId && (!this.requestIds || this.requestIds.length === 0)) {
    return next(new Error('Assignment must have either requestId (single) or requestIds (batch)'));
  }
  next();
});

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
