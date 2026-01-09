import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AddSubCaste = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [casteId, setCasteId] = useState("");
  const [castes, setCastes] = useState([]);
 const token = localStorage.getItem("authToken");

  // Fetch all castes for dropdown
  useEffect(() => {
    const fetchCastes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/cast`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCastes(response.data.castes);
        if (response.data.castes.length > 0) {
          setCasteId(response.data.castes[0]._id);
        }
      } catch (error) {
        console.error("Error fetching castes:", error);
        Swal.fire("Error", "Failed to fetch castes.", "error");
      }
    };
    fetchCastes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/subcast`,
        { name, caste:casteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success!", "SubCaste added successfully!", "success");
      navigate(-1);
    } catch (error) {
      console.error("Error adding subcaste:", error);
      Swal.fire("Error!", "Failed to add subcaste", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Add SubCaste
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* SubCaste Name */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">SubCaste Name</label>
          <input
            type="text"
            placeholder="Enter subcaste name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Caste Dropdown */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Caste</label>
          <select
            value={casteId}
            onChange={(e) => setCasteId(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          >
            {castes.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-40 bg-primary text-white font-medium py-2 rounded-md transition duration-300"
        >
          Add SubCaste
        </button>
      </form>
    </div>
  );
};

export default AddSubCaste;


