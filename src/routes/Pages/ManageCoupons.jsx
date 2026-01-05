import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, PlusCircle, Search, Tag, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from "../../components/Config";
import { Link } from "react-router-dom";

const formatDate = (value) => {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "-";
  return d.toLocaleDateString();
};

const formatValue = (coupon) => {
  if (coupon.type === "percent") return `${coupon.value || 0}%`;
  return `Rs. ${coupon.value || 0}`;
};

const ManageCoupons = () => {
  const token = localStorage.getItem("authToken");
  const [coupons, setCoupons] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/coupons`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching coupons:", error);
      Swal.fire("Error", "Failed to fetch coupons.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (couponId) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/coupons/${couponId}/toggle`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons((prev) =>
        prev.map((c) => (c._id === couponId ? { ...c, isActive: !c.isActive } : c))
      );
    } catch (error) {
      console.error("Error toggling coupon:", error);
      Swal.fire("Error", "Failed to toggle coupon.", "error");
    }
  };

  const handleDelete = async (couponId) => {
    const confirm = await Swal.fire({
      title: "Delete coupon?",
      text: "This cannot be undone.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Delete",
    });
    if (!confirm.isConfirmed) return;

    try {
      await axios.delete(`${API_BASE_URL}/api/coupons/${couponId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCoupons((prev) => prev.filter((c) => c._id !== couponId));
      Swal.fire("Deleted", "Coupon removed.", "success");
    } catch (error) {
      console.error("Error deleting coupon:", error);
      Swal.fire("Error", "Failed to delete coupon.", "error");
    }
  };

  const filteredCoupons = coupons.filter((coupon) =>
    (coupon.code || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div>Loading coupons...</div>;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-rose-50 via-white to-white p-6 shadow-sm dark:border-gray-800 dark:from-rose-900/30 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-white/90 p-2 text-rose-600 shadow-sm dark:bg-slate-800">
              <Tag size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Coupons</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create and manage discount codes with plan and usage limits.
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search coupon"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-64 rounded-lg border border-gray-200 bg-white pl-10 pr-3 text-sm font-medium text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100"
              />
            </div>
            <Link to="/add-coupon" className="btn-primary flex items-center gap-2">
              <PlusCircle size={18} /> Add Coupon
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredCoupons.length > 0 ? (
          filteredCoupons.map((coupon) => (
            <div
              key={coupon._id}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md dark:border-gray-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {coupon.code}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {coupon.description || "No description"}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-rose-50 px-2 py-1 font-semibold text-rose-600">
                      {formatValue(coupon)}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                      {coupon.type === "percent" ? "Percent" : "Flat"}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                      {coupon.appliesToAll ? "All plans" : "Selected plans"}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleToggle(coupon._id)}
                    className="text-gray-500 hover:text-primary"
                    title="Toggle"
                  >
                    {coupon.isActive ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
                  </button>
                  <Link to={`/edit-coupon/${coupon._id}`} title="Edit Coupon">
                    <Edit className="text-blue-500 hover:text-blue-700" size={20} />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(coupon._id)}
                    className="text-red-500 hover:text-red-700"
                    title="Delete Coupon"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-2 text-xs text-gray-600 dark:text-gray-300">
                <div className="flex flex-wrap gap-2">
                  <span className={`rounded-full px-2 py-1 font-semibold ${coupon.isActive ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>
                    {coupon.isActive ? "Active" : "Inactive"}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                    Valid: {formatDate(coupon.startAt)} - {formatDate(coupon.endAt)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                    Usage: {coupon.usageCount || 0}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                    Min: Rs. {coupon.minAmount || 0}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                    Max off: Rs. {coupon.maxDiscount || 0}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                    Per user: {coupon.maxUsagePerUser || 0}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-600">
                    Total: {coupon.maxUsageTotal || 0}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-gray-500 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-300">
            No coupons found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageCoupons;
