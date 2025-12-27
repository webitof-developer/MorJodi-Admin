import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import API_BASE_URL from "../../components/Config";

const ReferralSetting = () => {
  const token = localStorage.getItem('authToken');
  const [bonus, setBonus] = useState('');
  const [loading, setLoading] = useState(false);

  // 🧠 Fetch current referralBonus from backend
  const fetchReferralBonus = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/settings`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const referralSetting = res.data.find((s) => s.key === "referralBonus");
      if (referralSetting) {
        setBonus(referralSetting.value);
      }
    } catch (err) {
      console.error("Error fetching referral bonus:", err);
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: 'Failed to fetch referral bonus!',
      });
    } finally {
      setLoading(false);
    }
  };

  // 💾 Update referral bonus
  const handleSave = async () => {
    if (!bonus || isNaN(bonus) || Number(bonus) < 0) {
      return Swal.fire({
        icon: 'warning',
        title: 'Invalid Value!',
        text: 'Please enter a valid positive number.',
      });
    }

    try {
      await axios.put(`${API_BASE_URL}/api/settings`, {
        settings: [{ key: "referralBonus", value: bonus }],
      },{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      Swal.fire({
        icon: 'success',
        title: 'Updated!',
        text: 'Referral bonus updated successfully.',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      console.error("Error updating referral bonus:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error!',
        text: 'Failed to update referral bonus. Please try again.',
      });
    }
  };

  useEffect(() => {
    fetchReferralBonus();
  }, []);

  return (
 <div className="max-w-6xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Referral Bonus Setting</h1>

      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : (
        <div >
          <label className="block text-gray-700 dark:text-gray-300">
            Referral Bonus Amount
          </label>
          <input
            type="number"
            min="0"
            value={bonus}
            onChange={(e) => setBonus(e.target.value)}
             className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
                dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleSave}
            className="mt-4 w-40 bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Save
          </button>
        </div>
      )}
    </div>
  );
};

export default ReferralSetting;
