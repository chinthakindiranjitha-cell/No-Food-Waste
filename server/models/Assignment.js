import mongoose from 'mongoose';

const assignmentSchema = new mongoose.Schema(
  {
    requestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FoodRequest',
      required: [true, 'Food Request ID is required']
    },
    volunteerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Volunteer ID is required']
    },
    status: {
      type: String,
      enum: ['assigned', 'in_progress', 'completed'],
      default: 'assigned'
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    completedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Assignment = mongoose.model('Assignment', assignmentSchema);
export default Assignment;
