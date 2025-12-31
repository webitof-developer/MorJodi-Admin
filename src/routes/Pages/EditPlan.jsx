import React, { useState, useEffect } from "react";
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
  "Interest Request"
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
        setFeatures(planData.features || []);
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
    const featureIndex = features.findIndex(f => f.name === featureName);
    if (featureIndex > -1) {
      setFeatures(features.filter((f) => f.name !== featureName));
    } else {
      setFeatures([...features, { name: featureName, limit: 0 }]);
    }
  };

  const handleLimitChange = (featureName, limit) => {
    const newFeatures = features.map(f => {
      if (f.name === featureName) {
        return { ...f, limit: parseInt(limit, 10) || 0 };
      }
      return f;
    });
    setFeatures(newFeatures);
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
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
        Edit Plan {isFree && <span className='text-lg text-green-500'>(Free Plan)</span>}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Plan Name</label>
            <input
              type="text"
              placeholder="e.g., Silver Plan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
                dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Price (₹)</label>
            <input
              type="number"
              placeholder="e.g., 999"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              required
              disabled={isFree}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
                dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        {/* Offer Price + Discount */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Offer Price (₹)</label>
            <input
              type="number"
              placeholder="e.g., 799"
              value={offerPrice}
              onChange={(e) => setOfferPrice(Number(e.target.value))}
              disabled={isFree}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 
                dark:bg-gray-700 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Discount %</label>
            <input
              type="text"
              value={`${discountPercent}%`}
              readOnly
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-white cursor-not-allowed"
            />
          </div>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Duration (in Days)</label>
          <input
            type="number"
            placeholder="e.g., 30, 90, 180"
            value={durationInDays}
            onChange={(e) => setDurationInDays(Number(e.target.value))}
            required
            disabled={isFree}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Features Section */}
        <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Select Features</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {AVAILABLE_FEATURES.map((featureName) => {
              const isChecked = features.some(f => f.name === featureName);
              const featureLimit = features.find(f => f.name === featureName)?.limit ?? 0;
              return (
                <div key={featureName} className="flex flex-col gap-2 p-2 border rounded-md">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleFeatureToggle(featureName)}
                      className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded 
                        focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 
                        focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <span className="text-gray-700 dark:text-gray-300">{featureName}</span>
                  </label>
                  {isChecked && (
                    <div>
                      <label className="text-sm text-gray-600 dark:text-gray-400">Limit (0 for unlimited)</label>
                      <input
                        type="number"
                        value={featureLimit}
                        onChange={(e) => handleLimitChange(featureName, e.target.value)}
                        className="mt-1 block w-full px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md 
                          focus:outline-none focus:ring-1 focus:ring-primary 
                          dark:bg-gray-700 dark:text-white"
                      />
                      {featureLimit === 0 && <span className="text-xs text-gray-500">(Unlimited)</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-primary dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <label htmlFor="isActive" className="ml-2 text-gray-700 dark:text-gray-300">
            Is Active?
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-40 bg-primary text-white font-medium py-2 rounded-md transition duration-300 hover:bg-opacity-80"
        >
          Update Plan
        </button>
      </form>
    </div>
  );
};

export default EditPlan;


