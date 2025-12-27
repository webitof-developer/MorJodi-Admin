import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import API_BASE_URL from "../../components/Config";

const EditAdvertising = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [advertisingData, setAdvertisingData] = useState({
    type: "",
    content: "",
    imageUrl: "",
    videoUrl: "",
    link: "",
    startDate: "",
    endDate: "",
    order: 0,
    isActive: true,
  });

  const [imageFile, setImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(true);



  // ==================================
  // FETCH EXISTING ADVERTISING
  // ==================================
  useEffect(() => {
    const fetchAd = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/advertising/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = res.data.advertising;

        setAdvertisingData({
          ...data,
          startDate: data.startDate
            ? new Date(data.startDate).toISOString().split("T")[0]
            : "",
          endDate: data.endDate
            ? new Date(data.endDate).toISOString().split("T")[0]
            : "",
        });
      } catch (err) {
        console.error("Fetch error:", err);
        Swal.fire("Error", "Failed to load advertising", "error");
      } finally {
        setLoading(false);
      }
    };

    fetchAd();
  }, [id, token]);

  // ==================================
  // INPUT HANDLER
  // ==================================
  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (name === "file") {
      if (advertisingData.type === "image") {
        setImageFile(files[0]);
        setVideoFile(null);
      } else if (advertisingData.type === "video") {
        setVideoFile(files[0]);
        setImageFile(null);
      }
      return;
    }

    if (name === "type") {
      setAdvertisingData((prev) => ({
        ...prev,
        type: value,
        imageUrl: "",
        videoUrl: "",
      }));
      setImageFile(null);
      setVideoFile(null);
      return;
    }

    setAdvertisingData({
      ...advertisingData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  // ==================================
  // SUBMIT
  // ==================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData();

    // normal fields
    Object.entries(advertisingData).forEach(([key, val]) => {
      if (key === "content") return;
      if (val !== undefined && val !== null) formData.append(key, val);
    });

    // content
    if (advertisingData.type === "content") {
      formData.append("content", advertisingData.content);
    }

    // file uploads
    if (imageFile) {
      formData.append("file", imageFile);
      formData.delete("videoUrl");
    } else if (videoFile) {
      formData.append("file", videoFile);
      formData.delete("imageUrl");
    }

    try {
      await axios.put(`${API_BASE_URL}/api/advertising/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      Swal.fire("Success", "Advertising updated!", "success");
      navigate("/manage-advertising");
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
     <div
      className="max-w-7xl mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow"
    >
      <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
        Edit Advertising
      </h2>
        <form onSubmit={handleSubmit}>

          {/* TYPE */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Advertising Type</label>
            <select
              name="type"
              value={advertisingData.type}
              onChange={handleChange}
              className="mt-1 block w-full border px-3 py-2 rounded"
            >
              <option value="">Select Type</option>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </div>



          {/* IMAGE */}
          {advertisingData.type === "image" && (
            <div className="mb-4">
              <label className="block text-sm font-medium">Image</label>

              {advertisingData.imageUrl && !imageFile && (
                <p className="text-sm mb-2">
                  Current:{" "}
                  <a href={advertisingData.imageUrl} target="_blank">
                    View
                  </a>
                </p>
              )}

              <input
                type="file"
                name="file"
                accept="image/*"
                onChange={handleChange}
                className="block mt-1 w-full border px-3 py-2 rounded"
              />
            </div>
          )}

          {/* VIDEO */}
          {advertisingData.type === "video" && (
            <div className="mb-4">
              <label className="block text-sm font-medium">Video</label>

              {advertisingData.videoUrl && !videoFile && (
                <div className="mb-2">
                  <p className="text-sm mb-2">Current Video:</p>
                  <video
                    controls
                    className="w-32 h-auto border border-gray-300 rounded"
                  >
                    <source src={advertisingData.videoUrl} />
                  </video>
                </div>
              )}

              <input
                type="file"
                name="file"
                accept="video/*"
                onChange={handleChange}
                className="block mt-1 w-full border px-3 py-2 rounded"
              />

              {videoFile && (
                <div className="mt-2">
                  <p className="text-sm mb-2">New Video Preview:</p>
                  <video
                    controls
                    className="w-32 h-auto border border-gray-300 rounded"
                  >
                    <source src={URL.createObjectURL(videoFile)} />
                  </video>
                </div>
              )}
            </div>
          )}

          {/* LINK */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Link</label>
            <input
              type="text"
              name="link"
              value={advertisingData.link}
              onChange={handleChange}
              className="block mt-1 w-full border px-3 py-2 rounded"
            />
          </div>

          {/* DATES */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Start Date</label>
            <input
              type="date"
              name="startDate"
              value={advertisingData.startDate}
              onChange={handleChange}
              className="block mt-1 w-full border px-3 py-2 rounded"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium">End Date</label>
            <input
              type="date"
              name="endDate"
              value={advertisingData.endDate}
              onChange={handleChange}
              className="block mt-1 w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* ORDER */}
          <div className="mb-4">
            <label className="block text-sm font-medium">Order</label>
            <input
              type="number"
              name="order"
              value={advertisingData.order}
              onChange={handleChange}
              className="block mt-1 w-full border px-3 py-2 rounded"
              required
            />
          </div>

          {/* ACTIVE */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={advertisingData.isActive}
              onChange={handleChange}
              className="mr-2"
            />
            <label>Is Active</label>
          </div>

          {/* BUTTONS */}
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => navigate("/manage-advertising")}
              className="mr-4 py-2 px-4 border rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-2 px-4 rounded bg-primary text-white"
            >
              {loading ? "Updating..." : "Update Advertising"}
            </button>
          </div>
        </form>
      
    </div>
  );
};

export default EditAdvertising;
