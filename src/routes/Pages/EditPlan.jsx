import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AVAILABLE_FEATURES = [
  "Chat Limit",
  "Profile View",
  "Contact View",
  "Photo View",
  "See Who Viewed Your Profile",
  "Interest Request",
];

const EditPlan = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("authToken");

  const [name, setName] = useState("");
  const [price, setPrice] = useState(0);
  const [offerPrice, setOfferPrice] = useState(0);
  const [discountPercent, setDiscountPercent] = useState(0);
  const [durationInDays, setDurationInDays] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isFree, setIsFree] = useState(false);
  const [features, setFeatures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (price > 0 && offerPrice > 0 && offerPrice < price) {
      const discount = Math.round(((price - offerPrice) / price) * 100);
      setDiscountPercent(discount);
    } else {
      setDiscountPercent(0);
    }
  }, [price, offerPrice]);

  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/plans/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const planData = response.data;

        setName(planData.name);
        setPrice(planData.price);
        setOfferPrice(planData.offerPrice || 0);
        setDurationInDays(planData.durationInDays);
        setIsActive(planData.isActive);
        setIsFree(planData.isFree);

        const normalized = (planData.features || []).map((feature) => {
          if (feature.name === "Contact View") {
            const dailyLimit = feature.dailyLimit ?? feature.limit ?? 0;
            return {
              ...feature,
              dailyLimit,
              monthlyLimit: feature.monthlyLimit ?? 0,
              limit: dailyLimit,
            };
          }
          return feature;
        });
        setFeatures(normalized);
      } catch (error) {
        console.error("Error fetching plan data:", error);
        Swal.fire("Error", "Failed to fetch plan data.", "error");
        navigate("/plans");
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [id, navigate, token]);

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
        isActive,
        features,
      };

      await axios.patch(`${API_BASE_URL}/api/plans/${id}`, planData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Success!", "Plan updated successfully!", "success");
      navigate(-1);
    } catch (error) {
      console.error("Error updating plan:", error);
      Swal.fire("Error!", "Failed to update plan", "error");
    }
  };

  if (loading) {
    return <div>Loading plan data...</div>;
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-rose-50 via-white to-white p-5 shadow-sm dark:border-gray-800 dark:from-rose-900/30 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[240px] flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Subscription Plan
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Edit Plan {isFree && <span className="text-sm text-emerald-600">(Free)</span>}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Contact View supports monthly limits with an optional daily cap.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                isActive
                  ? "bg-emerald-100 text-emerald-700"
                  : "bg-rose-100 text-rose-700"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
            {offerPrice > 0 && offerPrice < price && !isFree && (
              <span className="rounded-full bg-[#f8f9fa] shadow-sm px-3 py-1 text-[11px] font-semibold text-rose-600 shadow-sm dark:bg-slate-800">
                Offer Rs. {offerPrice}
              </span>
            )}
            <span className="rounded-full bg-[#f8f9fa] shadow-sm px-3 py-1 text-[11px] font-semibold text-gray-600 shadow-sm dark:bg-slate-800 dark:text-gray-200">
              {durationInDays || 0} days
            </span>
            <span className="rounded-full bg-[#f8f9fa] shadow-sm px-3 py-1 text-[11px] font-semibold text-gray-600 shadow-sm dark:bg-slate-800 dark:text-gray-200">
              {isFree ? "Free" : `Rs. ${price || 0}`}
            </span>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-200 bg-[#f8f9fa] shadow-sm px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:-translate-y-[1px] hover:border-primary hover:text-primary hover:shadow-md dark:border-gray-700 dark:bg-slate-900 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-plan-form"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
            >
              Update Plan
            </button>
          </div>
        </div>
      </div>

      <form id="edit-plan-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[1.05fr_1.4fr]">
          <div className="rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-sm p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Plan details</h3>
              {isFree && (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                  Free Plan
                </span>
              )}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Plan name
                <input
                  type="text"
                  placeholder="e.g., Silver Plan"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Price (Rs.)
                <input
                  type="number"
                  placeholder="e.g., 999"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  required
                  disabled={isFree}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Offer price (Rs.)
                <input
                  type="number"
                  placeholder="e.g., 799"
                  value={offerPrice}
                  onChange={(e) => setOfferPrice(Number(e.target.value))}
                  disabled={isFree}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-500/40 disabled:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Discount
                <input
                  type="text"
                  value={`${discountPercent}%`}
                  readOnly
                  className="mt-1 w-full rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-sm text-gray-700 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Duration (days)
                <input
                  type="number"
                  placeholder="e.g., 30"
                  value={durationInDays}
                  onChange={(e) => setDurationInDays(Number(e.target.value))}
                  required
                  disabled={isFree}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:bg-gray-100 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
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

          <div className="rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-sm p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Feature limits</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Daily limits apply to all features. Contact View also supports monthly caps.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {AVAILABLE_FEATURES.map((featureName) => {
                const isChecked = features.some((f) => f.name === featureName);
                const feature = features.find((f) => f.name === featureName) || {};
                return (
                  <div
                    key={featureName}
                    className="rounded-xl border border-gray-200 bg-gray-50 p-3 shadow-sm dark:border-gray-700 dark:bg-slate-800"
                  >
                    <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 dark:text-gray-200">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => handleFeatureToggle(featureName)}
                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                      />
                      {featureName}
                    </label>

                    {isChecked && featureName !== "Contact View" && (
                      <div className="mt-2">
                        <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                          Daily limit (0 = unlimited)
                        </label>
                        <input
                          type="number"
                          value={feature.limit ?? 0}
                          onChange={(e) => handleLimitChange(featureName, "limit", e.target.value)}
                          className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-900 dark:text-white"
                        />
                      </div>
                    )}

                    {isChecked && featureName === "Contact View" && (
                      <div className="mt-2 grid gap-2">
                        <div className="grid grid-cols-2 gap-2">
                          <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                            Monthly
                            <input
                              type="number"
                              value={feature.monthlyLimit ?? 0}
                              onChange={(e) =>
                                handleLimitChange(featureName, "monthlyLimit", e.target.value)
                              }
                              className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-900 dark:text-white"
                            />
                          </label>
                          <label className="text-[11px] font-semibold text-gray-500 dark:text-gray-400">
                            Daily cap
                            <input
                              type="number"
                              value={feature.dailyLimit ?? feature.limit ?? 0}
                              onChange={(e) =>
                                handleLimitChange(featureName, "dailyLimit", e.target.value)
                              }
                              className="mt-1 w-full rounded-lg border border-gray-300 px-2.5 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-900 dark:text-white"
                            />
                          </label>
                        </div>
                        <p className="text-[11px] text-gray-500">
                          Daily cap is optional. If set to 0, monthly quota can be used anytime.
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </form>
    </div>
  );


};

export default EditPlan;
