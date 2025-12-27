import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Swal from "sweetalert2";
import API_BASE_URL from "../../components/Config";

const EditProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
const token = localStorage.getItem("authToken");
  const [formData, setFormData] = useState({
    fullName: "",
  
    email: "",
    phoneNumber: "",
    image: null,
    previewImage: "",
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/api/user/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        const { fullName, email, phoneNumber, image } = response.data.user;

        setFormData({
          fullName: fullName || "",
        
          email: email || "",
          phoneNumber: phoneNumber || "",
          image: null,
          previewImage: image ? image : "",
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        image: file,
        previewImage: URL.createObjectURL(file),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("authToken"); 

    const formDataToSend = new FormData();
    formDataToSend.append("fullName", formData.fullName);
  
    formDataToSend.append("email", formData.email);
    formDataToSend.append("phoneNumber", formData.phoneNumber);
    if (formData.image) {
      formDataToSend.append("image", formData.image);
    }

    try {
      await axios.put(
        `${API_BASE_URL}/api/user/${id}`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      Swal.fire({
        icon: "success",
        title: "Profile Updated!",
        text: "Your profile has been updated successfully.",
        confirmButtonColor: "#8254ff",
      }).then(() => {
        navigate("/dashboard");
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      Swal.fire({
        icon: "error",
        title: "Update Failed",
        text:
          error.response?.data?.message ||
          "Something went wrong. Please try again!",
        confirmButtonColor: "#ff4b4b",
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-6 p-6 bg-white dark:bg-gray-800 shadow-lg rounded-lg">
      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">
        Edit Profile
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Full Name
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
         
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Phone Number
            </label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Profile Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
          />
        </div>

        {formData.previewImage && (
          <div className="flex mt-4">
            <img
              src={formData.previewImage}
              alt="Preview"
              className="w-24 h-24 rounded-full object-cover"
            />
          </div>
        )}

        <button
          type="submit"
          className="w-40 bg-primary text-white font-medium py-2 rounded-md mt-4"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};

export default EditProfile;
