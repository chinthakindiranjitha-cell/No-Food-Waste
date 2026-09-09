import mongoose from 'mongoose';

export const CATEGORY_WINDOWS_HOURS = {
  cooked: 2,
  perishable: 6,
  packaged: 24
};

export const calculateExpiresAt = (foodCategory, referenceDate = new Date()) => {
  const hours = CATEGORY_WINDOWS_HOURS[foodCategory] || 2;
  return new Date(new Date(referenceDate).getTime() + hours * 60 * 60 * 1000);
};

export const getUrgencyLevel = (doc) => {
  const category = doc.foodCategory || 'cooked';
  const totalWindowMs = (CATEGORY_WINDOWS_HOURS[category] || 2) * 60 * 60 * 1000;

  const createdTime = doc.createdAt ? new Date(doc.createdAt).getTime() : Date.now();
  const expiresTime = doc.expiresAt
    ? new Date(doc.expiresAt).getTime()
    : createdTime + totalWindowMs;

  const remainingMs = expiresTime - Date.now();
  const ratio = remainingMs / totalWindowMs;

  if (remainingMs <= 0 || ratio < 0.20) {
    return 'critical';
  } else if (ratio <= 0.50) {
    return 'warning';
  }
  return 'safe';
};

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
    foodCategory: {
      type: String,
      enum: ['cooked', 'perishable', 'packaged'],
      default: 'cooked'
    },
    expiresAt: {
      type: Date
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

foodRequestSchema.set('toJSON', { virtuals: true });
foodRequestSchema.set('toObject', { virtuals: true });

foodRequestSchema.virtual('urgencyLevel').get(function () {
  return getUrgencyLevel(this);
});

const FoodRequest = mongoose.model('FoodRequest', foodRequestSchema);
export default FoodRequest;

