import React, { useState, useEffect } from "react";
import axios from "axios";
import { ShieldOff, ShieldCheck, Trash, Search, CheckCircle, FilePenLine } from "lucide-react";
import Swal from "sweetalert2";
import img1 from '../../assets/user-1.jpg';
import img2 from '../../assets/user-2.jpg';
import img3 from '../../assets/user-3.jpg';
import img4 from '../../assets/user-4.jpg';
import API_BASE_URL from "../../components/Config";
import { Link } from "react-router-dom";

const ManageUser = () => {
  const token = localStorage.getItem('authToken');
  console.log(token)
 
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchCriteria, setSearchCriteria] = useState({
    name: "",
    gender: "",
    religion: "",
    maritalStatus: "",
  });

  const images = [img1, img2, img3, img4];
  const getAvatar = (index) => images[index % images.length];

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/user/alluser`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
        console.log(response.data)
      const filteredUsers = response.data.filter(user => user.role === 'user');
      setUsers(filteredUsers);
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error", "Failed to fetch users.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/user/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setUsers(users.filter((user) => user._id !== id));
          Swal.fire("Deleted!", "User has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting user:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const handleBlockToggle = async (id, isBlocked) => {
    Swal.fire({
      title: isBlocked ? "Unblock this user?" : "Block this user?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: isBlocked ? "Unblock" : "Block",
      confirmButtonColor: isBlocked ? "#3085d6" : "#d33",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
       
          await axios.put(`${API_BASE_URL}/api/user/block/${id}`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          const updatedUsers = users.map(user =>
            user._id === id ? { ...user, isBlocked: !isBlocked } : user
          );
          setUsers(updatedUsers);
          Swal.fire("Success!", `User ${isBlocked ? "unblocked" : "blocked"} successfully.`, "success");
        } catch (error) {
          console.error("Error updating user:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const handleApprove = async (userId) => {
    Swal.fire({
        title: "Are you sure?",
        text: `You are about to approve this profile.`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: `Yes, approve it!`,
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                await axios.patch(`${API_BASE_URL}/api/user/approve-profile/${userId}`, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                setUsers(prevUsers =>
                    prevUsers.map(user =>
                        user._id === userId ? { ...user, isApproved: true } : user
                    )
                );
                Swal.fire(`Approved!`, `Profile has been approved.`, "success");
            } catch (error) {
                console.error(`Error approving profile:`, error);
                Swal.fire("Error!", "Something went wrong.", "error");
            }
        }
    });
};

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchCriteria({
        ...searchCriteria,
        [name]: value,
    });
  };

  const filteredUsers = users.filter(user => {
    const { name, gender, religion, maritalStatus } = searchCriteria;
    return (
        (user.fullName || '').toLowerCase().includes(name.toLowerCase()) &&
        (gender === '' || (user.gender && user.gender.toLowerCase() === gender.toLowerCase())) &&
        (religion === '' || (user.religion && user.religion.name && user.religion.name.toLowerCase().includes(religion.toLowerCase()))) &&
        (maritalStatus === '' || (user.maritalStatus && user.maritalStatus.toLowerCase() === maritalStatus.toLowerCase()))
    );
  });

  if (loading) {
    return <div>Loading users...</div>;
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white">All Users</h2>
        <div className="flex items-center gap-4">
          <div className="relative">
              <input
                  type="text"
                  name="name"
                  placeholder="Search by name"
                  value={searchCriteria.name}
                  onChange={handleSearchChange}
                  className="px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
              <Search className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" size={18} />
          </div>
          <div className="relative">
              <select
                  name="gender"
                  value={searchCriteria.gender}
                  onChange={handleSearchChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                  <option value="">All Genders</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
              </select>
          </div>
          <div className="relative">
              <input
                  type="text"
                  name="religion"
                  placeholder="Search by religion"
                  value={searchCriteria.religion}
                  onChange={handleSearchChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
          </div>
          <div className="relative">
              <select
                  name="maritalStatus"
                  value={searchCriteria.maritalStatus}
                  onChange={handleSearchChange}
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                  <option value="">All Marital Statuses</option>
                  <option value="never married">Never Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                  <option value="awaiting divorce">Awaiting Divorce</option>
              </select>
          </div>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Image</th>
                <th className="table-head">Name</th>
                <th className="table-head">Phone</th>
                <th className="table-head">Gender</th>
                <th className="table-head">Religion</th>
                <th className="table-head">Marital Status</th>
                <th className="table-head">Premium</th>
                <th className="table-head">Approval</th>
                <th className="table-head">Status</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user, index) => (
                  <tr key={user._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">
                      <div className="flex gap-x-1 w-14 h-14 overflow-hidden rounded-full border">
                        <img
                          src={user?.photos?.[0] ? `${user.photos[0]}` : getAvatar(index)}
                          alt={user.fullName}
                          className="size-full rounded-sm object-cover"
                        />
                      </div>
                    </td>
                    <td className="table-cell">{user.fullName}</td>
                    <td className="table-cell">{user.phoneNumber}</td>
                    <td className="table-cell">{user.gender}</td>
                    <td className="table-cell">{user.religion?.name}</td>
                    <td className="table-cell">{user.maritalStatus}</td>
                    <td className="table-cell">
                      {user.isPremium ? (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">Premium</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-full">Free</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {user.isApproved ? (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-500 rounded-full">Approved</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-500 rounded-full">Not Approved</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {user.isBlocked ? (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-500 rounded-full">Blocked</span>
                      ) : (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-500 rounded-full">Active</span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-x-4">
                        <Link to={`/edit-user/${user._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                            <FilePenLine size={20} />
                        </Link>
                        {user.isApproved !== true && (
                            <button
                                onClick={() => handleApprove(user._id)}
                                className="text-green-500 hover:text-green-700"
                                title="Approve"
                            >
                                <CheckCircle size={22} />
                            </button>
                        )}
                        <button
                          onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                          className="text-gray-600 hover:text-primary"
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          {user.isBlocked ? <ShieldCheck size={22} /> : <ShieldOff size={22} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete User"
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td colSpan="11" className="table-cell text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManageUser;
