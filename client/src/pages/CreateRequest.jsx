import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestService } from '../services/api';
import { Utensils, MapPin, Clock, Camera, Send, AlertCircle, ArrowLeft, CheckCircle2, Package } from 'lucide-react';

const CreateRequest = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    foodType: '',
    foodCategory: 'cooked',
    quantity: '',
    unit: 'meals',
    pickupAddress: '',
    timeWindowStart: '',
    timeWindowEnd: '',
    photoUrl: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.foodType.trim() || !formData.quantity || !formData.pickupAddress.trim()) {
      setFormError('Please fill in required fields: Food Description, Quantity, and Pickup Address.');
      return;
    }

    if (Number(formData.quantity) <= 0) {
      setFormError('Quantity must be a positive number.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        foodType: formData.foodType.trim(),
        foodCategory: formData.foodCategory,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        pickupAddress: formData.pickupAddress.trim(),
        timeWindowStart: formData.timeWindowStart || null,
        timeWindowEnd: formData.timeWindowEnd || null,
        photos: formData.photoUrl.trim() ? [formData.photoUrl.trim()] : []
      };

      const res = await requestService.createRequest(payload);
      setIsSubmitting(false);

      if (res.success) {
        navigate('/requests/my', {
          state: { message: 'Food request created successfully! Volunteers will be notified.' }
        });
      }
    } catch (err) {
      setIsSubmitting(false);
      setFormError(err.response?.data?.message || 'Failed to submit food request. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="bg-white rounded-2xl border border-amber-100 p-6 sm:p-10 shadow-sm space-y-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider mb-2">
            <Utensils className="w-3.5 h-3.5" /> Requester Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Submit Food Request
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Have surplus food? Fill out this quick 1-minute form to connect with local volunteers.
          </p>
        </div>

        {formError && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div>{formError}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Food Type */}
          <div>
            <label htmlFor="foodType" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Food Description <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Utensils className="h-4 w-4" />
              </div>
              <input
                id="foodType"
                name="foodType"
                type="text"
                required
                value={formData.foodType}
                onChange={handleChange}
                placeholder="e.g. 20 Packaged Lunch Boxes / Fresh Baked Pastries"
                className="block w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          {/* Food Category Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Food Safety Category <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label
                className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.foodCategory === 'cooked'
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-400'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="foodCategory"
                    value="cooked"
                    checked={formData.foodCategory === 'cooked'}
                    onChange={handleChange}
                    className="accent-amber-600"
                  />
                  <span className="font-bold text-slate-900 text-sm">Cooked Food</span>
                </div>
                <span className="text-xs text-amber-800 font-semibold mt-1">2-Hour Window</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Hot meals, catering surplus</span>
              </label>

              <label
                className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.foodCategory === 'perishable'
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-400'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="foodCategory"
                    value="perishable"
                    checked={formData.foodCategory === 'perishable'}
                    onChange={handleChange}
                    className="accent-amber-600"
                  />
                  <span className="font-bold text-slate-900 text-sm">Perishable</span>
                </div>
                <span className="text-xs text-amber-800 font-semibold mt-1">6-Hour Window</span>
                <span className="text-[11px] text-slate-500 mt-0.5">Produce, dairy, raw foods</span>
              </label>

              <label
                className={`flex flex-col p-3.5 rounded-xl border cursor-pointer transition-all ${
                  formData.foodCategory === 'packaged'
                    ? 'border-amber-500 bg-amber-50/70 ring-1 ring-amber-400'
                    : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="foodCategory"
                    value="packaged"
                    checked={formData.foodCategory === 'packaged'}
                    onChange={handleChange}
                    className="accent-amber-600"
                  />
                  <span className="font-bold text-slate-900 text-sm">Packaged</span>
                </div>
                <span className="text-xs text-amber-800 font-semibold mt-1">24-Hour Window</span>
                <span className="text-[11px] text-slate-500 mt-0.5 font-normal">Canned &amp; dry goods</span>
              </label>
            </div>
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="quantity" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Quantity <span className="text-rose-500">*</span>
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Package className="h-4 w-4" />
                </div>
                <input
                  id="quantity"
                  name="quantity"
                  type="number"
                  min="1"
                  required
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 25"
                  className="block w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="unit" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Unit <span className="text-rose-500">*</span>
              </label>
              <select
                id="unit"
                name="unit"
                value={formData.unit}
                onChange={handleChange}
                className="block w-full px-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none"
              >
                <option value="meals">Meals</option>
                <option value="boxes">Boxes</option>
                <option value="kg">Kilograms (kg)</option>
                <option value="crates">Crates</option>
                <option value="servings">Servings</option>
                <option value="items">Items</option>
              </select>
            </div>
          </div>

          {/* Pickup Address */}
          <div>
            <label htmlFor="pickupAddress" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Pickup Address <span className="text-rose-500">*</span>
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                id="pickupAddress"
                name="pickupAddress"
                type="text"
                required
                value={formData.pickupAddress}
                onChange={handleChange}
                placeholder="123 Main St, Suite 400, Downtown"
                className="block w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          {/* Time Window (Start & End) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="timeWindowStart" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Pickup Window Start
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="h-4 w-4" />
                </div>
                <input
                  id="timeWindowStart"
                  name="timeWindowStart"
                  type="datetime-local"
                  value={formData.timeWindowStart}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>

            <div>
              <label htmlFor="timeWindowEnd" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                Pickup Window End
              </label>
              <div className="relative rounded-xl shadow-2xs">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Clock className="h-4 w-4" />
                </div>
                <input
                  id="timeWindowEnd"
                  name="timeWindowEnd"
                  type="datetime-local"
                  value={formData.timeWindowEnd}
                  onChange={handleChange}
                  className="block w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none"
                />
              </div>
            </div>
          </div>

          {/* Optional Photo URL */}
          <div>
            <label htmlFor="photoUrl" className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Photo URL (Optional)
            </label>
            <div className="relative rounded-xl shadow-2xs">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Camera className="h-4 w-4" />
              </div>
              <input
                id="photoUrl"
                name="photoUrl"
                type="url"
                value={formData.photoUrl}
                onChange={handleChange}
                placeholder="https://example.com/food-photo.jpg"
                className="block w-full pl-10 pr-4 py-3 text-sm text-slate-900 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm text-white bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:opacity-60 transition-colors shadow-md cursor-pointer"
            >
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Submitting Request...
                </span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Submit Request Now
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateRequest;
