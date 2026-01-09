import React, { useEffect, useState } from "react";
import axios from "axios";
import { Edit, PlusCircle, Scale, Search, Trash } from "lucide-react";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from "../../components/Config";
import { Link } from "react-router-dom";

const ManagePlans = () => {
  const token = localStorage.getItem("authToken");
  const [plans, setPlans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(response.data || []);
    } catch (error) {
      console.error("Error fetching plans:", error);
      Swal.fire("Error", "Failed to fetch plans.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (planId) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This plan will be deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`${API_BASE_URL}/api/plans/${planId}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setPlans(plans.filter((p) => p._id !== planId));
          Swal.fire("Deleted!", "Plan has been deleted.", "success");
        } catch (error) {
          console.error("Error deleting plan:", error);
          Swal.fire("Error!", "Something went wrong.", "error");
        }
      }
    });
  };

  const filteredPlans = plans.filter((plan) =>
    (plan.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatFeature = (feature) => {
    if (feature.name === "Contact View") {
      const monthlyLimit = feature.monthlyLimit ?? 0;
      const dailyLimit = feature.dailyLimit ?? feature.limit ?? 0;
      if (monthlyLimit > 0 && dailyLimit > 0) {
        return `${feature.name} (${monthlyLimit}/mo, ${dailyLimit}/day)`;
      }
      if (monthlyLimit > 0) {
        return `${feature.name} (${monthlyLimit}/mo)`;
      }
      if (dailyLimit > 0) {
        return `${feature.name} (${dailyLimit}/day)`;
      }
      return `${feature.name} (Unlimited)`;
    }

    if (feature.limit > 0) {
      return `${feature.name} (${feature.limit}/day)`;
    }
    return `${feature.name} (Unlimited)`;
  };

  if (loading) {
    return <div>Loading Plans...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-rose-50 via-white to-white p-6 shadow-sm dark:border-gray-800 dark:from-rose-900/30 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#f8f9fa] shadow-sm/90 p-2 text-rose-600 shadow-sm dark:bg-slate-800">
              <Scale size={22} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Subscription Plans</h2>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Create, edit, and control plan access with monthly and daily limits.
              </p>
            </div>
          </div>

          <div className="ml-auto flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
              <input
                type="text"
                placeholder="Search plan"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-64 rounded-lg border border-gray-200 bg-[#f8f9fa] shadow-sm pl-10 pr-3 text-sm font-medium text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100"
              />
            </div>
            <Link to="/addplan" className="btn-primary flex items-center gap-2">
              <PlusCircle size={18} /> Add Plan
            </Link>
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {filteredPlans.length > 0 ? (
          filteredPlans.map((plan) => (
            <div
              key={plan._id}
              role="button"
              tabIndex={0}
              onClick={() => {
                window.location.href = `/editplan/${plan._id}`;
              }}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  window.location.href = `/editplan/${plan._id}`;
                }
              }}
              className="rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-sm p-5 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-800 dark:bg-slate-900"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {plan.name}
                    {plan.isFree && <span className="ml-2 text-xs text-emerald-600">Free</span>}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {plan.durationInDays} days - {plan.isFree ? "Free" : `Rs. ${plan.price}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      plan.isActive
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {plan.isActive ? "Active" : "Inactive"}
                  </span>
                  <Link
                    to={`/editplan/${plan._id}`}
                    title="Edit Plan"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <Edit className="text-blue-500 hover:text-blue-700" size={20} />
                  </Link>
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDelete(plan._id);
                    }}
                    className={`text-red-500 hover:text-red-700 ${plan.isFree && "cursor-not-allowed opacity-50"}`}
                    title="Delete Plan"
                    disabled={plan.isFree}
                  >
                    <Trash size={20} />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-xs text-gray-600 dark:border-gray-800 dark:bg-slate-800 dark:text-gray-300">
                  <p className="font-semibold uppercase tracking-wide text-gray-500">Features</p>
                  <ul className="mt-2 grid gap-1 text-sm text-gray-700 dark:text-gray-200">
                    {plan.features && plan.features.length > 0 ? (
                      plan.features.map((feature, index) => (
                        <li key={index}>- {formatFeature(feature)}</li>
                      ))
                    ) : (
                      <li className="text-gray-400">No features configured</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-[#f8f9fa] shadow-sm p-10 text-center text-gray-500 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-300">
            No plans found.
          </div>
        )}
      </div>
    </div>
  );
};

export default ManagePlans;
