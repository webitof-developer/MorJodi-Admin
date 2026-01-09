 import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from "../../components/Config";



const AddAdvertising = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [type, setType] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [link, setLink] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [order, setOrder] = useState(0);
  const [loading, setLoading] = useState(false);



  // =============================
  // SUBMIT HANDLER
  // =============================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("type", type);
      formData.append("link", link);
      formData.append("startDate", startDate);
      formData.append("endDate", endDate);
      formData.append("order", order);

      if (type === "image" && imageFile) {
        formData.append("file", imageFile);
      } else if (type === "video" && videoFile) {
        formData.append("file", videoFile);
      }

      await axios.post(`${API_BASE_URL}/api/advertising`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Success", "Advertising added successfully!", "success");
      navigate("/manage-advertising");
    } catch (error) {
      console.error("Error adding advertising:", error);
      Swal.fire(
        "Error",
        error.response?.data?.message || "Failed to add advertising.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="max-w-7xl mx-auto p-6 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-lg shadow"
    >
      <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
        Add New Advertising
      </h2>

      <form onSubmit={handleSubmit}>
        {/* TYPE SELECT */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500 }}>
            Advertising Type
          </label>
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setContent("");
              setImageFile(null);
              setVideoFile(null);
            }}
             className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary
              dark:bg-gray-700 dark:text-white"
            required
          >
            <option value="">Select Type</option>
            <option value="image">Image</option>
            <option value="video">Video</option>
          </select>
        </div>




        {/* IMAGE UPLOAD */}
        {type === "image" && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>Image</label>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
              onChange={(e) => setImageFile(e.target.files[0])}
              required
            />
          </div>
        )}

        {/* VIDEO UPLOAD */}
        {type === "video" && (
          <div style={{ marginBottom: "16px" }}>
            <label style={{ fontSize: "14px", fontWeight: 500 }}>Video</label>
            <input
              type="file"
              accept="video/*"
               className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
            />
          </div>
        )}

        {/* LINK */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500 }}>
            Redirect Link (Optional)
          </label>
          <input
            type="text"
            value={link}
            onChange={(e) => setLink(e.target.value)}
           className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                        focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
                        dark:bg-gray-700 dark:text-white"
          />
        </div>

        {/* DATES */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500 }}>Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
             className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500 }}>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* ORDER */}
        <div style={{ marginBottom: "16px" }}>
          <label style={{ fontSize: "14px", fontWeight: 500 }}>Order</label>
          <input
            type="number"
            value={order}
            onChange={(e) => setOrder(e.target.value)}
            className="mt-1 block w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
              focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary 
              dark:bg-gray-700 dark:text-white"
            required
          />
        </div>

        {/* BUTTONS */}
        <div style={{ marginTop: "24px", textAlign: "right" }}>
          
          <button
            type="submit"
            disabled={loading}
           className="w-40 bg-primary text-white font-medium py-2 rounded-md transition duration-300"
          >
            {loading ? "Adding..." : "Add Advertising"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddAdvertising;


