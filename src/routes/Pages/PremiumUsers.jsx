import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { CheckCircle, FilePenLine, Search, ShieldCheck, ShieldOff, Trash } from "lucide-react";
import Swal from "/src/utils/swalTheme";
import { Link } from "react-router-dom";

import API_BASE_URL from "../../components/Config";
import LoadingState from "../../components/LoadingState";
import img1 from "../../assets/user-1.jpg";
import img2 from "../../assets/user-2.jpg";
import img3 from "../../assets/user-3.jpg";
import img4 from "../../assets/user-4.jpg";

const PremiumUsers = () => {
  const token = localStorage.getItem("authToken");
  const [users, setUsers] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState({ name: "", phone: "", approval: "", status: "" });

  const avatars = useMemo(() => [img1, img2, img3, img4], []);
  const getAvatar = (index) => avatars[index % avatars.length];

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE_URL}/api/user/premium-users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          page,
          limit: pageSize === "All" ? 200 : pageSize,
          searchTerm: filters.name || filters.phone,
          searchBy: filters.phone ? "phone" : "name",
          approval: filters.approval,
          status: filters.status,
        },
      });
      setUsers(res.data.users || []);
      setCount(res.data.total || res.data.count || 0);
      setPage(Math.min(page, res.data.totalPages || page));
    } catch (error) {
      console.error("Error fetching premium users:", error);
      Swal.fire("Error", "Failed to fetch premium users.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
    setPage(1);
  };

  const filtered = users;

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
            headers: { Authorization: `Bearer ${token}` },
          });
          setUsers((prev) => prev.filter((user) => user._id !== id));
          setCount((prev) => Math.max(prev - 1, 0));
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
          await axios.put(
            `${API_BASE_URL}/api/user/block/${id}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setUsers((prev) =>
            prev.map((user) =>
              user._id === id ? { ...user, isBlocked: !isBlocked } : user,
            ),
          );
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
      title: "Approve this profile?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, approve it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.patch(
            `${API_BASE_URL}/api/user/approve-profile/${userId}`,
            {},
            { headers: { Authorization: `Bearer ${token}` } },
          );
          setUsers((prev) =>
            prev.map((user) => (user._id === userId ? { ...user, isApproved: true } : user)),
          );
          Swal.fire("Approved!", "Profile has been approved.", "success");
        } catch (error) {
          console.error("Error approving profile:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  return (
    <div className="card space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Premium users</p>
          <h2 className="text-lg font-semibold dark:text-white">Active premium members</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                name="name"
                value={filters.name}
                onChange={handleFilterChange}
                placeholder="Search name"
                className="input-soft pl-10"
              />
              <Search size={16} className="absolute left-3 top-3 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="relative">
              <input
                type="text"
                name="phone"
                value={filters.phone}
                onChange={handleFilterChange}
                placeholder="Search phone"
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              />
            </div>
            <div className="relative">
              <select
                name="approval"
                value={filters.approval}
                onChange={handleFilterChange}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Approval</option>
                <option value="approved">Approved</option>
                <option value="pending">Not Approved</option>
              </select>
            </div>
            <div className="relative">
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600 dark:text-gray-300">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                const next = e.target.value === "All" ? "All" : Number(e.target.value);
                setPageSize(next);
                setPage(1);
              }}
              className="rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              {[10, 20, 50, 100, "All"].map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-xl bg-primary/10 px-4 py-2 text-sm font-semibold text-primary dark:bg-primary/15">
            Total: {count}
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingState label="Loading users..." rows={7} />
      ) : (
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Image</th>
                <th className="table-head">Name</th>
                <th className="table-head">Phone</th>
                <th className="table-head">Premium</th>
                <th className="table-head">Approval</th>
                <th className="table-head">Status</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filtered.length > 0 ? (
                (() => {
                  const effectivePageSize = pageSize === "All" ? filtered.length || 1 : pageSize;
                  const totalPages = Math.max(1, Math.ceil((count || filtered.length || 1) / effectivePageSize));
                  const currentPage = Math.min(page, totalPages);
                  const startIndex = (currentPage - 1) * effectivePageSize;
                  const paginated = filtered.slice(startIndex, startIndex + effectivePageSize);
                  return paginated.map((user, index) => (
                  <tr key={user._id} className="table-row">
                    <td className="table-cell">{startIndex + index + 1}</td>
                    <td className="table-cell">
                      <div className="flex h-14 w-14 overflow-hidden rounded-full border">
                        <img
                          src={user?.photos?.[0] ? `${user.photos[0]}` : getAvatar(index)}
                          alt={user.fullName}
                          className="size-full object-cover"
                        />
                      </div>
                    </td>
                    <td className="table-cell">{user.fullName}</td>
                    <td className="table-cell">{user.phoneNumber}</td>
                    <td className="table-cell">
                      <span className="rounded-full bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-600 dark:bg-purple-900/30 dark:text-purple-100">
                        Premium
                      </span>
                    </td>
                    <td className="table-cell">
                      {user.isApproved ? (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-500 dark:bg-green-900/30 dark:text-green-100">
                          Approved
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-100">
                          Not Approved
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      {user.isBlocked ? (
                        <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-500 dark:bg-red-900/30 dark:text-red-100">
                          Blocked
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-500 dark:bg-green-900/30 dark:text-green-100">
                          Active
                        </span>
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
                  ));
                })()
              ) : (
                <tr className="table-row">
                  <td colSpan="11" className="table-cell text-center text-gray-500">
                    No premium users found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            {(() => {
              const effectivePageSize = pageSize === "All" ? filtered.length || 1 : pageSize;
              const totalPages = Math.max(1, Math.ceil((count || filtered.length || 1) / effectivePageSize));
              const currentPage = Math.min(page, totalPages);
              const startIndex = (currentPage - 1) * effectivePageSize;
              return (
                <>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    Showing {filtered.length === 0 ? 0 : startIndex + 1} -{" "}
                    {Math.min(startIndex + effectivePageSize, count || filtered.length)} of {count || filtered.length}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      className="rounded-lg border px-3 py-1 text-sm hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700"
                      disabled={currentPage === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      type="button"
                    >
                      Prev
                    </button>
                    <span className="text-sm text-gray-700 dark:text-gray-200">
                      Page {currentPage} / {totalPages}
                    </span>
                    <button
                      className="rounded-lg border px-3 py-1 text-sm hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700"
                      disabled={currentPage === totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      type="button"
                    >
                      Next
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

export default PremiumUsers;


