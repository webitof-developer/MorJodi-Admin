import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { useNavigate } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const AddCaste = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("GEN");
  const [religionId, setReligionId] = useState("");
  const [religions, setReligions] = useState([]);
 const token = localStorage.getItem("authToken");

  useEffect(() => {
    const fetchReligions = async () => {
      try {
       
        const response = await axios.get(`${API_BASE_URL}/api/religion`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setReligions(response.data.religions);
        if (response.data.religions.length > 0) {
          setReligionId(response.data.religions[0]._id);
        }
      } catch (error) {
        console.error("Error fetching religions:", error);
        Swal.fire("Error", "Failed to fetch religions.", "error");
      }
    };
    fetchReligions();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${API_BASE_URL}/api/cast`,
        { name, category, religion: religionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      Swal.fire("Success!", "Cast added successfully!", "success");
      navigate(-1);
    } catch (error) {
      console.error("Error adding cast:", error);
      Swal.fire("Error!", "Failed to add cast", "error");
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
        Add Cast
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Cast Name */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Cast Name</label>
          <input
            type="text"
            placeholder="Enter cast name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          >
            <option value="GEN">GEN</option>
            <option value="OBC">OBC</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>
        </div>

        {/* Religion */}
        <div>
          <label className="block text-gray-700 dark:text-gray-300">Religion</label>
          <select
            value={religionId}
            onChange={(e) => setReligionId(e.target.value)}
            required
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
          >
            {religions.map((r) => (
              <option key={r._id} value={r._id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-40 bg-primary text-white font-medium py-2 rounded-md transition duration-300"
        >
          Add Cast
        </button>
      </form>
    </div>
  );
};

export default AddCaste;


