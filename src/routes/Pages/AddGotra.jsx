import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AddGotra = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [subCasteId, setSubCasteId] = useState("");
  const [subCastes, setSubCastes] = useState([]);
  const token = localStorage.getItem("authToken");

  // Fetch all subcastes for dropdown
  useEffect(() => {
    const fetchSubCastes = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/subcast`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSubCastes(response.data.subCastes);
        if (response.data.subCastes.length > 0) {
          setSubCasteId(response.data.subCastes[0]._id);
        }
      } catch (error) {
        console.error("Error fetching subcastes:", error);
        Swal.fire("Error", "Failed to fetch subcastes.", "error");
      }
    };
    fetchSubCastes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/gotra`,
        { name, subCaste: subCasteId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success! ", "Gotra added successfully!", "success");
      navigate(-1);
    } catch (error) {
      console.error("Error adding gotra:", error);
      Swal.fire("Error!", "Failed to add gotra", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Add Gotra
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Gotra Name */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Gotra Name</label>
          <input
            type="text"
            placeholder="Enter gotra name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* SubCaste Dropdown */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">SubCaste</label>
          <select
            value={subCasteId}
            onChange={(e) => setSubCasteId(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          >
            {subCastes.map((sc) => (
              <option key={sc._id} value={sc._id}>
                {sc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-40 bg-primary text-white font-medium py-2 rounded-md transition duration-300"
        >
          Add Gotra
        </button>
      </form>
    </div>
  );
};

export default AddGotra;