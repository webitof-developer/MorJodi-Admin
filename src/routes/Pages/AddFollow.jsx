import React, { useState } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AddFollow = () => {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState("");
  const [link, setLink] = useState("");
  const token = localStorage.getItem("authToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/follow`,
        { platform, link },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success!", "Link added successfully!", "success");
      navigate(-1); // Go back to the previous page
    } catch (error) {
      console.error("Error adding link:", error);
      Swal.fire("Error!", "Failed to add link", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Add Follow Us Link
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Platform */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Platform</label>
          <input
            type="text"
            placeholder="Enter platform (e.g., Instagram, Facebook)"
            value={platform}
            onChange={(e) => setPlatform(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Link */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Link</label>
          <input
            type="text"
            placeholder="Enter the full URL"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-40 bg-primary text-white font-medium py-2 rounded-md transition duration-300"
        >
          Add Link
        </button>
      </form>
    </div>
  );
};

export default AddFollow;


