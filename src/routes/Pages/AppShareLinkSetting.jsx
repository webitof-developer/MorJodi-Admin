import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AppShareLinkSetting = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [appShareLink, setAppShareLink] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAppShareLink();
  }, []);

  const fetchAppShareLink = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/settings/app-share-link`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAppShareLink(response.data.link || "");
    } catch (error) {
      Swal.fire("Error!", "Failed to fetch app share link", "error");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.put(
        `${API_BASE_URL}/api/settings/app-share-link`,
        { link: appShareLink },       // ❗CORRECT KEY
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Success!", res.data.message, "success");
      navigate(-1);
    } catch (error) {
      Swal.fire("Error!", "Failed to update app share link", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-md shadow">
      <h2 className="text-lg font-semibold dark:text-white">
        App Share Link Setting
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block mb-2 text-gray-700 dark:text-gray-300">
            App Share Link
          </label>
          <input
            type="url"
            value={appShareLink}
            onChange={(e) => setAppShareLink(e.target.value)}
            required
            placeholder="https://Playstore.link"
            className="w-full px-4 py-2 border dark:bg-gray-700 dark:text-white rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-40 bg-primary text-white py-2 rounded-md hover:bg-opacity-80 disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Link"}
        </button>
      </form>
    </div>
  );
};

export default AppShareLinkSetting;
