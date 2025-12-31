import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AddAbout = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("About MorJodi");
  const [content, setContent] = useState("");
 const token = localStorage.getItem("authToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/about`,
        { title, content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success!", "About section added successfully!", "success");
      navigate(-1); // Go back to previous page
    } catch (error) {
      console.error("Error adding About section:", error);
      Swal.fire("Error!", "Failed to add About section", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Add About Section
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Title</label>
          <input
            type="text"
            placeholder="Enter section title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Content */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Content</label>
          <textarea
            placeholder="Enter content for About"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            rows="6"
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
          Add About
        </button>
      </form>
    </div>
  );
};

export default AddAbout;


