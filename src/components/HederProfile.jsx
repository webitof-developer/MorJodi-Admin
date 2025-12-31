import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ProfileImg from "../../src/assets/user-1.jpg";
import { FiMail, FiLogOut, FiUser } from "react-icons/fi";
import API_BASE_URL from "../components/Config";
import Swal from "/src/utils/swalTheme";

const HederProfile = () => {
const token = localStorage.getItem("authToken");
 
  const dropdownRef = useRef(null);

  const [userData, setUserData] = useState({
     fullName: "",
    image: ProfileImg,
    role: "Admin",
    email: "",
  });

  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

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
          fullName:userResponse.data.user.fullName || "fullName",
        
          role: userResponse.data.user.role || prev.role,
           image: userResponse.data.user.image ? userResponse.data.user.image : prev.image,
          email: userResponse.data.user.email || prev.email,
          _id: userResponse.data.user._id || null,
        }));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [token]);

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
        navigate("/");
      }
    });
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center">
        <img src={userData.image} alt="Profile" className="w-10 h-10 rounded-full object-cover" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-[300px] bg-slate-50 dark:bg-gray-800 rounded-lg shadow-lg p-4 z-50  overflow-x-hidden ">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50">User Profile</h2>
          <div className="flex items-center gap-4 py-4">
            <img src={userData.image} alt="Profile" className="w-20 h-20 rounded-full object-cover" />
            <div>
               <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50">
                {userData.fullName} 
              </h3>
              {userData.role !== "client" && (
                <p className="text-sm font-medium text-slate-900 transition-colors dark:text-slate-50">
                  {userData.role}
                </p>
              )}
              <p className="text-sm flex items-center gap-2 text-gray-600 dark:text-gray-300  ">
                <FiMail className="text-gray-500 dark:text-gray-400 " /> {userData.email || "No Email"}
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate(`/editprofile/${userData._id}`)}
          
            className="w-full flex items-center justify-center gap-2 border border-primary text-primary bg-transparent font-medium py-2 rounded-lg dark:border-primary dark:text-primary mb-2"
          >
            <FiUser size={18} /> Edit Profile
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 border border-primary text-primary bg-transparent font-medium py-2 rounded-lg dark:border-primary dark:text-primary"
          >
            <FiLogOut size={18} /> Logout
          </button>
        </div>
      )}
    </div>
  );
};

export default HederProfile;

