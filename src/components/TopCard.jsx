import React, { useEffect, useState } from "react";
import axios from "axios";
import { Users, Star, MessageSquare, Trash2, Megaphone } from "lucide-react";
import API_BASE_URL from "./Config";

const TopCard = () => {
  const token = localStorage.getItem("authToken");
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPremiumUsers, setTotalPremiumUsers] = useState(0);
  const [totalComplaints, setTotalComplaints] = useState(0);
  const [totalDeletionRequests, setTotalDeletionRequests] = useState(0);
  const [totalActiveAdvertising, setTotalActiveAdvertising] = useState(0);

  useEffect(() => {
    fetchTotalUsers();
    fetchTotalPremiumUsers();
    fetchTotalComplaints();
    fetchTotalDeletionRequests();
    fetchTotalActiveAdvertising();
  }, []);

  // 🚀 Total Users
  const fetchTotalUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/count`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTotalUsers(res.data.totalUsers || 0);
    } catch (error) {
      console.error("Total users fetch error:", error);
    }
  };

  // 🚀 Premium Users
  const fetchTotalPremiumUsers = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/premium/count`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setTotalPremiumUsers(res.data.premiumUserCount || 0);
    } catch (error) {
      console.error("Total premium users fetch error:", error);
    }
  };

  // 🚀 Complaints
  const fetchTotalComplaints = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/complaints/count`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
console.log(res.data)
      setTotalComplaints(res.data.totalComplaints || 0);
    } catch (error) {
      console.error("Total complaints fetch error:", error);
    }
  };

  // 🚀 Deletion Requests
  const fetchTotalDeletionRequests = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/deletion-requests/count`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.data)
      setTotalDeletionRequests(res.data.totalDeletionRequests || 0);
    } catch (error) {
      console.error("Total deletion requests fetch error:", error);
    }
  };

  // 🚀 Active Advertising
  const fetchTotalActiveAdvertising = async () => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/advertising/active/count`,{
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.data)
      setTotalActiveAdvertising(res.data.totalActiveAdvertising || 0);
    } catch (error) {
      console.error("Total active advertising fetch error:", error);
    }
  };

  const cards = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: <Users className="w-6 h-6 text-primary" />,
    },
    {
      label: "Premium Users",
      value: totalPremiumUsers,
      icon: <Star className="w-6 h-6 text-primary" />,
    },
    {
      label: "Total Complaints",
      value: totalComplaints,
      icon: <MessageSquare className="w-6 h-6 text-primary" />,
    },
    {
      label: "Total Deletion Requests",
      value: totalDeletionRequests,
      icon: <Trash2 className="w-6 h-6 text-primary" />,
    },
    {
      label: "Total Active Advertising",
      value: totalActiveAdvertising,
      icon: <Megaphone className="w-6 h-6 text-primary" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 p-3">
      {cards.map((card, index) => (
        <div
          key={index}
          className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl p-6 transition-colors"
        >
          <div className="flex items-center space-x-5">
            <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full">
              {card.icon}
            </div>
            <div>
              <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                {card.label}
              </p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {card.value}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TopCard;
