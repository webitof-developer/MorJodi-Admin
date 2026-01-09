import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from "../../components/Config";

const DefaultUserSetting = () => {
  const token = localStorage.getItem("authToken");
  const [settings, setSettings] = useState({
    default_interest_limit: "",
    default_chat_limit: "",
    default_profile_view_limit: "",
    default_photo_view_limit: "",
    user_approval_mode: "manual", // Default

  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/settings/default`);
      const fetchedSettings = data.reduce((acc, setting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      setSettings(prev => ({ ...prev, ...fetchedSettings }));
    } catch (error) {
      console.error("Error fetching settings:", error);
      Swal.fire("Error!", "Failed to fetch settings.", "error");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const settingsArray = Object.keys(settings).map((key) => ({
        key,
        value: settings[key],
      }));

      await axios.put(`${API_BASE_URL}/api/settings/default`,
        {
          settings: settingsArray,
        }, {
        headers: { Authorization: `Bearer ${token}` }, // ✅ Add this
      });

      Swal.fire("Success!", "Settings updated successfully.", "success");
    } catch (error) {
      console.error("Error updating settings:", error);
      Swal.fire("Error!", "Failed to update settings.", "error");
    }
  };

  return (
    <div className="container mx-auto p-4">

      <form
        onSubmit={handleSubmit}
        className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 p-6 rounded-lg shadow-md space-y-4"
      >
        <h1 className="text-lg font-semibold dark:text-white">Default User Settings</h1>
        {Object.keys(settings).map((key) => (
          <div className="mb-4" key={key}>
            <label
              htmlFor={key}
              className="block text-gray-700 dark:text-gray-300 text-sm font-semibold mb-2"
            >
              {key
                .replace(/_/g, " ")
                .replace(/default/, "Default")
                .replace(/limit/, "Limit")
                .replace(/referralBonus/, "Referral Bonus")}
              :
            </label>

            {key === 'user_approval_mode' ? (
              <div>
                <select
                  id={key}
                  name={key}
                  value={settings[key]}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white 
                             focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                >
                  <option value="manual">Manual Approval</option>
                  <option value="automatic">Automatic Approval</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  <b>Manual:</b> New users must be approved by admin before accessing the app.<br />
                  <b>Automatic:</b> New users are instantly approved and can access the app immediately.
                </p>
              </div>
            ) : (
              <input
                type="text"
                id={key}
                name={key}
                value={settings[key]}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md dark:bg-gray-700 dark:text-white 
                           focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
              />
            )}
          </div>
        ))
        }

        <button
          type="submit"
          className="w-40 bg-primary text-white font-semibold py-2 rounded-md 
                     hover:bg-opacity-90 transition duration-300"
        >
          Save Settings
        </button>
      </form >
    </div >
  );
};

export default DefaultUserSetting;


