import React, { useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AddRaasi = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
 const token = localStorage.getItem("authToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      Swal.fire("Warning!", "Please enter Raasi name", "warning");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/raasi`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success!", "Raasi added successfully!", "success");
      navigate(-1);
    } catch (error) {
      console.error("Error adding Raasi:", error);
      Swal.fire("Error!", "Failed to add Raasi", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Add Raasi
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Raasi Name</label>
          <input
            type="text"
            placeholder="Enter Raasi name"
            value={name}
            onChange={(e) => setName(e.target.value)}
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
          Add Raasi
        </button>
      </form>
    </div>
  );
};

export default AddRaasi;
