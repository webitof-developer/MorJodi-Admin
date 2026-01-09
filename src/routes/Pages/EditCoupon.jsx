import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import { useNavigate, useParams } from "react-router-dom";
import API_BASE_URL from "../../components/Config";

const EditCoupon = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const token = localStorage.getItem("authToken");

  const [plans, setPlans] = useState([]);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("percent");
  const [value, setValue] = useState(0);
  const [maxDiscount, setMaxDiscount] = useState(0);
  const [minAmount, setMinAmount] = useState(0);
  const [maxUsageTotal, setMaxUsageTotal] = useState(0);
  const [maxUsagePerUser, setMaxUsagePerUser] = useState(0);
  const [startAt, setStartAt] = useState("");
  const [endAt, setEndAt] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [appliesToAll, setAppliesToAll] = useState(true);
  const [planIds, setPlanIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchCoupon();
  }, [id]);

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const fetchCoupon = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/coupons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCode(data.code || "");
      setDescription(data.description || "");
      setType(data.type || "percent");
      setValue(Number(data.value || 0));
      setMaxDiscount(Number(data.maxDiscount || 0));
      setMinAmount(Number(data.minAmount || 0));
      setMaxUsageTotal(Number(data.maxUsageTotal || 0));
      setMaxUsagePerUser(Number(data.maxUsagePerUser || 0));
      setStartAt(data.startAt ? new Date(data.startAt).toISOString().slice(0, 10) : "");
      setEndAt(data.endAt ? new Date(data.endAt).toISOString().slice(0, 10) : "");
      setIsActive(!!data.isActive);
      setAppliesToAll(data.appliesToAll !== false);
      setPlanIds((data.planIds || []).map((pid) => String(pid)));
    } catch (error) {
      console.error("Error fetching coupon:", error);
      Swal.fire("Error", "Failed to fetch coupon.", "error");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const togglePlan = (planId) => {
    setPlanIds((prev) =>
      prev.includes(planId) ? prev.filter((pid) => pid !== planId) : [...prev, planId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        code: code.trim().toUpperCase(),
        description,
        type,
        value,
        maxDiscount,
        minAmount,
        maxUsageTotal,
        maxUsagePerUser,
        startAt: startAt || null,
        endAt: endAt || null,
        isActive,
        appliesToAll,
        planIds: appliesToAll ? [] : planIds,
      };

      await axios.patch(`${API_BASE_URL}/api/coupons/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      Swal.fire("Success", "Coupon updated successfully.", "success");
      navigate(-1);
    } catch (error) {
      console.error("Error updating coupon:", error);
      Swal.fire("Error", error?.response?.data?.message || "Failed to update coupon.", "error");
    }
  };

  if (loading) return <div>Loading coupon...</div>;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-rose-50 via-white to-white p-5 shadow-sm dark:border-gray-800 dark:from-rose-900/30 dark:via-slate-900 dark:to-slate-900">
        <div className="flex flex-wrap items-center gap-4">
          <div className="min-w-[240px] flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Coupon Manager
            </p>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Edit Coupon</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Update limits, plans, and activity settings.
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg border border-gray-200 bg-[#f8f9fa] shadow-sm px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm transition hover:-translate-y-[1px] hover:border-primary hover:text-primary hover:shadow-md dark:border-gray-700 dark:bg-slate-900 dark:text-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="coupon-form"
              className="rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
            >
              Update Coupon
            </button>
          </div>
        </div>
      </div>

      <form id="coupon-form" onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-5 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-sm p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Basics</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Coupon code
                <input
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Discount type
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="percent">Percent</option>
                  <option value="flat">Flat</option>
                </select>
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Value
                <input
                  type="number"
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                  min="0"
                  required
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Max discount
                <input
                  type="number"
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(Number(e.target.value))}
                  min="0"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300 sm:col-span-2">
                Description
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-sm p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Rules</h3>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Minimum amount (Rs.)
                <input
                  type="number"
                  value={minAmount}
                  onChange={(e) => setMinAmount(Number(e.target.value))}
                  min="0"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Max usage (total)
                <input
                  type="number"
                  value={maxUsageTotal}
                  onChange={(e) => setMaxUsageTotal(Number(e.target.value))}
                  min="0"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Max usage per user
                <input
                  type="number"
                  value={maxUsagePerUser}
                  onChange={(e) => setMaxUsagePerUser(Number(e.target.value))}
                  min="0"
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                Start date
                <input
                  type="date"
                  value={startAt}
                  onChange={(e) => setStartAt(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-300">
                End date
                <input
                  type="date"
                  value={endAt}
                  onChange={(e) => setEndAt(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
              <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                />
                Coupon is active
              </label>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-[#f8f9fa] shadow-sm p-5 shadow-sm dark:border-gray-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Plan scope</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Apply to all plans or select specific plans.
              </p>
            </div>
            <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <input
                type="checkbox"
                checked={appliesToAll}
                onChange={(e) => setAppliesToAll(e.target.checked)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
              />
              Apply to all plans
            </label>
          </div>

          <div className={`mt-4 grid gap-3 sm:grid-cols-2 ${appliesToAll ? "opacity-50" : ""}`}>
            {plans.map((plan) => (
              <label key={plan._id} className="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={planIds.includes(plan._id)}
                  onChange={() => togglePlan(plan._id)}
                  disabled={appliesToAll}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:border-gray-600"
                />
                {plan.name}
              </label>
            ))}
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditCoupon;
