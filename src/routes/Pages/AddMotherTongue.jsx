import React, { useState } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AddMotherTongue = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
 const token = localStorage.getItem("authToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return Swal.fire("Error!", "Please enter a name.", "error");

    try {
      await axios.post(
        `${API_BASE_URL}/api/mothertongue`,
        { name },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire("Success!", "Mother Tongue added successfully!", "success");
      navigate(-1); // go back to previous page
    } catch (error) {
      console.error("Error adding mother tongue:", error);
      Swal.fire(
        "Error!",
        error.response?.data?.message || "Failed to add mother tongue",
        "error"
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Add Mother Tongue
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Mother Tongue Name</label>
          <input
            type="text"
            placeholder="Enter mother tongue"
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
          Add Mother Tongue
        </button>
      </form>
    </div>
  );
};

export default AddMotherTongue;


