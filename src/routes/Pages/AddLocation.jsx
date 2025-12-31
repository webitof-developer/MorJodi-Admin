import React, { useState } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AddLocation = () => {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [state, setState] = useState("Chhattisgarh");
  const [country, setCountry] = useState("India");
  const token = localStorage.getItem("authToken");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!city) {
      Swal.fire("Error!", "City is required", "error");
      return;
    }

    try {
      await axios.post(
        `${API_BASE_URL}/api/location`,
        { city, state, country },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success!", "Location added successfully!", "success");
      navigate(-1); // go back after add
    } catch (error) {
      console.error("Error adding location:", error);
      Swal.fire("Error!", "Failed to add location", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Add Location
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* City */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">City</label>
          <input
            type="text"
            placeholder="Enter city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">State</label>
          <input
            type="text"
            placeholder="State"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Country</label>
          <input
            type="text"
            placeholder="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
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
          Add Location
        </button>
      </form>
    </div>
  );
};

export default AddLocation;


