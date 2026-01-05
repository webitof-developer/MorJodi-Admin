import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AVAILABLE_FEATURES = [
  "Chat Limit",
  "Profile View",
  "Contact View",
  "Photo View",
  "See Who Viewed Your Profile",
  "Interest Request",
];

const AddPlan = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [offerPrice, setOfferPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [durationInDays, setDurationInDays] = useState(30);
  const [isActive, setIsActive] = useState(true);
  const [isFree, setIsFree] = useState(false);
  const [features, setFeatures] = useState([]);

  useEffect(() => {
    if (isFree) {
      setPrice(0);
      setOfferPrice(0);
      setDurationInDays(30);
    }
  }, [isFree]);

  useEffect(() => {
    if (price > 0 && offerPrice > 0 && offerPrice < price) {
      const discount = Math.round(((price - offerPrice) / price) * 100);
      setDiscountPercent(discount);
    } else {
      setDiscountPercent(0);
    }
  }, [price, offerPrice]);

  const handleFeatureToggle = (featureName) => {
    const featureIndex = features.findIndex((f) => f.name === featureName);
    if (featureIndex > -1) {
      setFeatures(features.filter((f) => f.name !== featureName));
    } else {
      if (featureName === "Contact View") {
        setFeatures([
          ...features,
          { name: featureName, monthlyLimit: 0, dailyLimit: 0, limit: 0 },
        ]);
      } else {
        setFeatures([...features, { name: featureName, limit: 0 }]);
      }
    }
  };

  const updateFeature = (featureName, updates) => {
    setFeatures((prev) =>
      prev.map((f) => (f.name === featureName ? { ...f, ...updates } : f))
    );
  };

  const handleLimitChange = (featureName, field, value) => {
    const parsedValue = parseInt(value, 10) || 0;
    if (featureName === "Contact View") {
      const updates = { [field]: parsedValue };
      if (field === "dailyLimit") {
        updates.limit = parsedValue;
      }
      updateFeature(featureName, updates);
    } else {
      updateFeature(featureName, { limit: parsedValue });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const planData = {
        name,
        price,
        offerPrice,
        durationInDays,
        features,
        isActive,
        isFree,
      };

      await axios.post(`${API_BASE_URL}/api/plans`, planData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Success!", "Plan added successfully!", "success");
      navigate(-1);
    } catch (error) {
      console.error("Error adding plan:", error);
      Swal.fire("Error!", "Failed to add plan", "error");
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-slate-900">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Add Subscription Plan</h2>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
          Configure pricing, duration, and per-feature limits. Contact View supports monthly and optional daily caps.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-slate-900">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFree"
              checked={isFree}
              onChange={(e) => setIsFree(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
            />
            <label htmlFor="isFree" className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              This is a free plan
            </label>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Plan name
              <input
                type="text"
                placeholder="e.g., Silver Plan"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Price (Rs.)
              <input
                type="number"
                placeholder="e.g., 999"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                required
                disabled={isFree}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Offer price (Rs.)
              <input
                type="number"
                placeholder="e.g., 799"
                value={offerPrice}
                onChange={(e) => setOfferPrice(Number(e.target.value))}
                disabled={isFree}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 disabled:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Discount
              <input
                type="text"
                value={`${discountPercent}%`}
                readOnly
                className="mt-2 block w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Duration (days)
              <input
                type="number"
                placeholder="e.g., 30"
                value={durationInDays}
                onChange={(e) => setDurationInDays(Number(e.target.value))}
                required
                disabled={isFree}
                className="mt-2 block w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
              />
              Plan is active
            </label>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-slate-900">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select features</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Monthly Contact View limits control total usage per month. Daily limit is optional.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {AVAILABLE_FEATURES.map((featureName) => {
              const isChecked = features.some((f) => f.name === featureName);
              const feature = features.find((f) => f.name === featureName) || {};
              return (
                <div
                  key={featureName}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-slate-800"
                >
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleFeatureToggle(featureName)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                    />
                    {featureName}
                  </label>

                  {isChecked && featureName !== "Contact View" && (
                    <div className="mt-3">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Daily limit (0 = unlimited)
                      </label>
                      <input
                        type="number"
                        value={feature.limit ?? 0}
                        onChange={(e) => handleLimitChange(featureName, "limit", e.target.value)}
                        className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-900 dark:text-white"
                      />
                    </div>
                  )}

                  {isChecked && featureName === "Contact View" && (
                    <div className="mt-3 grid gap-3">
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Monthly limit (0 = unlimited)
                        <input
                          type="number"
                          value={feature.monthlyLimit ?? 0}
                          onChange={(e) =>
                            handleLimitChange(featureName, "monthlyLimit", e.target.value)
                          }
                          className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-900 dark:text-white"
                        />
                      </label>
                      <label className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                        Daily limit (optional, 0 = no daily cap)
                        <input
                          type="number"
                          value={feature.dailyLimit ?? feature.limit ?? 0}
                          onChange={(e) =>
                            handleLimitChange(featureName, "dailyLimit", e.target.value)
                          }
                          className="mt-2 block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-900 dark:text-white"
                        />
                      </label>
                      <p className="text-xs text-gray-500">
                        If daily limit is 0, members can use the full monthly quota in a day.
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-200"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
          >
            Add Plan
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddPlan;
