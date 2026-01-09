import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileImg from "../assets/user-1.jpg";
import { FiPower } from "react-icons/fi";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from './Config'
export const UserProfile = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("authToken");


  const [userData, setUserData] = useState({

    fullName: "",
    image: ProfileImg,
    role: "Admin",
  });

  // Local state for menu visibility (if required)
  const [hideMenu, setHideMenu] = useState(false);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout!",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    });
  };

  useEffect(() => {
    const fetchUserData = async () => {


      try {
        const userResponse = await axios.get(`${API_BASE_URL}/api/user/singleuser`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUserData((prev) => ({
          ...prev,
          fullName: userResponse.data?.user?.fullName || "Admin",
          role: userResponse.data?.user?.role || prev.role,
          image: userResponse.data?.user?.image ? userResponse.data.user.image : prev.image,
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
        // Ensure we don't crash, maybe redirect to login if 401?
        if (error.response?.status === 401) {
          // Optional: navigate("/login");
        }
      }
    };

    fetchUserData();
  }, [token]);

  return (
    <div className="flex items-center gap-4 p-2 rounded-lg shadow-md  bg-slate-100 transition-colors dark:bg-gray-800">
      <img src={userData.image} alt="Profile" className="w-12 h-12 rounded-full object-cover" />
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
          {userData.fullName}
        </h3>
        {userData.role !== "client" && (
          <p className="text-sm text-slate-900 transition-colors dark:text-slate-50">
            {userData.role}
          </p>
        )}
      </div>
      <button className="ml-auto hover:text-black" onClick={handleLogout}>
        <FiPower size={20} className=" text-primary" />
      </button>
    </div>
  );
};
