import mongoose from 'mongoose';

const foodRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Requester ID is required']
    },
    foodType: {
      type: String,
      required: [true, 'Please specify the food type'],
      trim: true
    },
    quantity: {
      type: Number,
      required: [true, 'Please specify the quantity']
    },
    unit: {
      type: String,
      required: [true, 'Please specify the unit (e.g. kg, meals, boxes)'],
      trim: true
    },
    pickupAddress: {
      type: String,
      required: [true, 'Please provide a pickup address'],
      trim: true
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null }
    },
    timeWindowStart: {
      type: Date,
      default: null
    },
    timeWindowEnd: {
      type: Date,
      default: null
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'assigned', 'collected', 'delivered'],
      default: 'pending'
    },
    photos: [
      {
        type: String
      }
    ],
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const FoodRequest = mongoose.model('FoodRequest', foodRequestSchema);
export default FoodRequest;
