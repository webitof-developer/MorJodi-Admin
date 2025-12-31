import React, { useState } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AddReligion = () => {
  const navigate = useNavigate();
  const [religionName, setReligionName] = useState("");
  const token = localStorage.getItem("authToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/religion`, 
        { name: religionName },
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Success!", "Religion added successfully!", "success");
      navigate(-1);
    } catch (error) {
      console.error("Error adding religion:", error);
      Swal.fire("Error!", "Failed to add religion", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Add Religion
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300">
            Religion Name
          </label>
          <input
            type="text"
            name="name"
            placeholder="Enter religion name"
            value={religionName}
            onChange={(e) => setReligionName(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="w-40 bg-primary text-white font-medium py-2 rounded-md transition duration-300"
        >
          Add Religion
        </button>
      </form>
    </div>
  );
};

export default AddReligion;


