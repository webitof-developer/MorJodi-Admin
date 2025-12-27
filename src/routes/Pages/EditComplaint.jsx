import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../components/Config";

const EditComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState(null);

  const [formState, setFormState] = useState({
    subject: "",
    message: "",
    status: "",
  });

  // ============================
  // Fetch Complaint
  // ============================
  useEffect(() => {
    const fetchComplaint = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/api/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setComplaint(res.data.complaint);

        setFormState({
          subject: res.data.complaint.subject,
          message: res.data.complaint.message,
          status: res.data.complaint.status,
        });

        setLoading(false);
      } catch (error) {
        Swal.fire("Error", "Failed to load complaint", "error");
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, token]);

  // ============================
  // Input Change
  // ============================
  const handleChange = (e) => {
    setFormState({
      ...formState,
      [e.target.name]: e.target.value,
    });
  };

  // ============================
  // Submit Update
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.put(`${API_BASE_URL}/api/complaints/${id}`, formState, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Success", "Complaint updated successfully", "success");

      navigate("/manage-complaints");

    } catch (error) {
      Swal.fire("Error", error.response?.data?.message || "Failed to update", "error");
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!complaint) return <div>Complaint not found</div>;

  return (
    <div className="card p-6">
      <h1 className="text-xl font-semibold mb-4 dark:text-white">Edit Complaint</h1>

      <form onSubmit={handleSubmit} className="space-y-4">

        <div>
          <label className="block mb-1 font-medium dark:text-gray-300">
            Subject
          </label>
          <input
            type="text"
            name="subject"
            value={formState.subject}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
            required
          />
        </div>

        <div>
          <label className="block mb-1 font-medium dark:text-gray-300">
            Message
          </label>
          <textarea
            name="message"
            rows="4"
            value={formState.message}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
            required
          ></textarea>
        </div>

        <div>
          <label className="block mb-1 font-medium dark:text-gray-300">
            Status
          </label>
          <select
            name="status"
            value={formState.status}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:text-white"
          >
            <option value="open">Open</option>
            <option value="in progress">In Progress</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
        >
          Save Changes
        </button>

      </form>
    </div>
  );
};

export default EditComplaint;
