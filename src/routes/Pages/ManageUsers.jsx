import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import { useDebounce } from "use-debounce";
import {
  ShieldOff,
  ShieldCheck,
  Trash,
  Search,
  CheckCircle,
  FilePenLine,
  User,
  Phone,
  Fingerprint,
  Download,
  Crown,
  PauseCircle,
  CalendarPlus,
  Ban,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  X,
} from "lucide-react";
import Swal from "/src/utils/swalTheme";
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
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [summary, setSummary] = useState({ total: 0, premium: 0, blocked: 0, pendingApproval: 0 });
  const [totalPages, setTotalPages] = useState(1);
  const [totalFiltered, setTotalFiltered] = useState(0);
  const [plans, setPlans] = useState([]);
  const [subscriptionDrawerOpen, setSubscriptionDrawerOpen] = useState(false);
  const [activeSubscriptionUser, setActiveSubscriptionUser] = useState(null);
  const [portalReady, setPortalReady] = useState(false);
  const [subscriptionForm, setSubscriptionForm] = useState({
    action: "assign",
    planId: "",
    extendDays: "30",
    pauseDays: "7",
    cancelMode: "immediate",
    customDays: "",
    note: "",
  });
  const [searchCriteria, setSearchCriteria] = useState({
    searchTerm: "",
    searchBy: "name", // name | phone | id
    premium: "",
    approval: "",
    status: "",
  });
  const [debouncedSearchCriteria] = useDebounce(searchCriteria, 300);
  const [profilePrefix, setProfilePrefix] = useState("MJ");
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkActionChoice, setBulkActionChoice] = useState("");

  const images = [img1, img2, img3, img4];
  const getAvatar = (index) => images[index % images.length];

  useEffect(() => {
    fetchUsers(debouncedSearchCriteria);
  }, [page, pageSize, debouncedSearchCriteria]);

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    fetchPrefix();
  }, []);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  const fetchUsers = async (criteria) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        searchTerm: criteria.searchTerm,
        searchBy: criteria.searchBy,
        premium: criteria.premium,
        approval: criteria.approval,
        status: criteria.status,
      };
      const { data } = await axios.get(`${API_BASE_URL}/api/user/alluser`, {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });
      setUsers(data.users || []);
      setSummary(data.summary || { total: 0, premium: 0, blocked: 0, pendingApproval: 0 });
      setTotalPages(data.totalPages || 1);
      setTotalFiltered(data.totalFiltered || 0);
      setPage((prev) => Math.min(prev, data.totalPages || 1));
    } catch (error) {
      console.error("Error fetching users:", error);
      Swal.fire("Error", "Failed to fetch users.", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchPrefix = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (Array.isArray(data)) {
        const setting =
          data.find((s) => s.key === "profile_id_prefix") || data.find((s) => s.key === "profile_prefix");
        if (setting?.value) setProfilePrefix(String(setting.value).toUpperCase());
      }
    } catch (error) {
      console.error("Error fetching prefix:", error);
    }
  };

  const fetchPlans = async () => {
    try {
      const { data } = await axios.get(`${API_BASE_URL}/api/plans`);
      setPlans(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const buildProfileId = (user) => {
    // If backend already provides a profileId/profileCode, trust it first.
    if (user?.profileId) return String(user.profileId).toUpperCase();
    if (user?.profileCode) return String(user.profileCode).toUpperCase();

    const prefix = profilePrefix || "MJ";
    const nameParts = (user.fullName || "").trim().split(/\s+/).filter(Boolean);
    let initials = "";
    if (nameParts.length >= 2) {
      initials = `${nameParts[0][0] || ""}${nameParts[1][0] || ""}`;
    } else if (nameParts.length === 1) {
      initials = (nameParts[0].slice(0, 2) || "XX");
    } else {
      initials = "XX";
    }
    initials = initials.toUpperCase();

    const stableSource =
      user.profileNumber ??
      user.sequenceNumber ??
      user.serialNumber ??
      user.profileCode ??
      user.userCode ??
      user._id ??
      "000";

    let seqNum = 0;
    if (typeof stableSource === "number") {
      seqNum = stableSource;
    } else if (typeof stableSource === "string") {
      const numeric = parseInt(stableSource.replace(/\D/g, ""), 10);
      if (!Number.isNaN(numeric)) {
        seqNum = numeric;
      } else {
        const hexPart = stableSource.slice(-6);
        const hexVal = parseInt(hexPart, 16);
        seqNum = Number.isNaN(hexVal) ? 0 : hexVal;
      }
    }
    const sequence = (Math.abs(seqNum) % 1000).toString().padStart(3, "0");

    let dobDay = "00";
    if (user.dateOfBirth) {
      const d = new Date(user.dateOfBirth);
      if (!Number.isNaN(d.getTime())) {
        dobDay = String(d.getDate()).padStart(2, "0");
      }
    }

    return `${prefix}${initials}${sequence}${dobDay}`;
  };

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "-";
    return date.toLocaleDateString();
  };

  const getPlanLabel = (user) => {
    return (
      user?.subscription?.plan?.name ||
      user?.plan?.name ||
      user?.planName ||
      (user?.isPremium ? "Premium" : "Free")
    );
  };

  const getSubscriptionStatus = (user) => {
    const now = new Date();
    const pausedUntil = user?.subscription?.pausedUntil ? new Date(user.subscription.pausedUntil) : null;
    const cancelAt = user?.subscription?.cancelAt ? new Date(user.subscription.cancelAt) : null;
    if (pausedUntil && pausedUntil > now) {
      return { label: "Paused", tone: "bg-amber-100 text-amber-700" };
    }
    if (cancelAt && cancelAt > now) {
      return { label: "Canceling", tone: "bg-rose-100 text-rose-700" };
    }
    if (!user?.isPremium) {
      return { label: "Free", tone: "bg-slate-100 text-slate-700" };
    }
    if (user?.subscription?.endDate || user?.premiumExpiresAt) {
      const end = new Date(user.subscription?.endDate || user.premiumExpiresAt);
      if (end <= now) {
        return { label: "Expired", tone: "bg-gray-200 text-gray-700" };
      }
    }
    return { label: "Active", tone: "bg-emerald-100 text-emerald-700" };
  };

  const openSubscriptionDrawer = (user) => {
    const fallbackPlan = plans.find((plan) => plan.isFree) || plans[0];
    setActiveSubscriptionUser(user);
    setSubscriptionForm((prev) => ({
      ...prev,
      action: "assign",
      planId: user?.subscription?.plan?.id || user?.planId || fallbackPlan?._id || "",
      extendDays: "30",
      pauseDays: "7",
      cancelMode: "immediate",
      note: "",
      customDays: "",
    }));
    setSubscriptionDrawerOpen(true);
  };

  const closeSubscriptionDrawer = () => {
    setSubscriptionDrawerOpen(false);
    setActiveSubscriptionUser(null);
  };

  const resolveDays = (value, customValue) => {
    if (value === "custom") {
      return Math.max(1, Number(customValue) || 0);
    }
    return Math.max(1, Number(value) || 0);
  };

  const applySubscriptionAction = async () => {
    if (!activeSubscriptionUser) return;
    const action = subscriptionForm.action;
    const plan = plans.find((p) => p._id === subscriptionForm.planId);
    const needsPlan = ["assign", "upgrade", "downgrade"].includes(action);
    if (needsPlan && !plan) {
      Swal.fire("Missing plan", "Select a plan before applying changes.", "warning");
      return;
    }

    const confirm = await Swal.fire({
      title: "Apply subscription change?",
      text: `This will ${action} the subscription for ${activeSubscriptionUser.fullName}.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Apply change",
    });
    if (!confirm.isConfirmed) return;

    const payload = {
      action,
      note: subscriptionForm.note || "",
    };
    if (needsPlan) {
      payload.planId = subscriptionForm.planId;
    }
    if (action === "extend") {
      payload.days = resolveDays(subscriptionForm.extendDays, subscriptionForm.customDays);
    }
    if (action === "pause") {
      payload.days = resolveDays(subscriptionForm.pauseDays, subscriptionForm.customDays);
    }
    if (action === "cancel") {
      payload.cancelMode = subscriptionForm.cancelMode;
    }

    try {
      const { data } = await axios.post(
        `${API_BASE_URL}/api/admin-subscriptions/${activeSubscriptionUser._id}`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      const updatedUser = data?.user || {};
      const updatedSubscription = data?.subscription || null;

      setUsers((prev) =>
        prev.map((u) =>
          u._id === activeSubscriptionUser._id
            ? { ...u, ...updatedUser, subscription: updatedSubscription }
            : u,
        ),
      );
      setActiveSubscriptionUser((prev) =>
        prev ? { ...prev, ...updatedUser, subscription: updatedSubscription } : prev,
      );
      await Swal.fire("Updated", "Subscription updated successfully.", "success");
      closeSubscriptionDrawer();
    } catch (error) {
      console.error("Subscription update failed:", error);
      Swal.fire(
        "Error",
        error?.response?.data?.message || "Failed to update subscription.",
        "error",
      );
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
    setSearchCriteria((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPage(1);
  };

  const filteredUsers = users;

  const totalUsers = summary.total ?? filteredUsers.length;
  const premiumCount =
    summary.premium ?? filteredUsers.filter((u) => u.isPremium).length;
  const blockedCount =
    summary.blocked ?? filteredUsers.filter((u) => u.isBlocked).length;
  const pendingApprovals =
    summary.pendingApproval ?? filteredUsers.filter((u) => !u.isApproved).length;

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedUsers.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedUsers.map((u) => u._id)));
    }
  };

  const bulkAction = async (action) => {
    if (selectedIds.size === 0) return;
    const ids = Array.from(selectedIds);
    const verb =
      action === "delete" ? "delete" : action === "approve" ? "approve" : action === "block" ? "block" : "unblock";
    const confirm = await Swal.fire({
      title: `Confirm ${verb}`,
      text: `Are you sure you want to ${verb} ${ids.length} user(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: `Yes, ${verb}`,
    });
    if (!confirm.isConfirmed) return;

    try {
      if (action === "delete") {
        await Promise.all(
          ids.map((id) =>
            axios.delete(`${API_BASE_URL}/api/user/${id}`, { headers: { Authorization: `Bearer ${token}` } }),
          ),
        );
        setUsers((prev) => prev.filter((u) => !selectedIds.has(u._id)));
      } else if (action === "approve") {
        await Promise.all(
          ids.map((id) =>
            axios.patch(
              `${API_BASE_URL}/api/user/approve-profile/${id}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } },
            ),
          ),
        );
        setUsers((prev) => prev.map((u) => (selectedIds.has(u._id) ? { ...u, isApproved: true } : u)));
      } else if (action === "block") {
        await Promise.all(
          ids.map((id) =>
            axios.put(
              `${API_BASE_URL}/api/user/block/${id}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } },
            ),
          ),
        );
        setUsers((prev) => prev.map((u) => (selectedIds.has(u._id) ? { ...u, isBlocked: true } : u)));
      } else if (action === "unblock") {
        await Promise.all(
          ids.map((id) =>
            axios.put(
              `${API_BASE_URL}/api/user/block/${id}`,
              {},
              { headers: { Authorization: `Bearer ${token}` } },
            ),
          ),
        );
        setUsers((prev) => prev.map((u) => (selectedIds.has(u._id) ? { ...u, isBlocked: false } : u)));
      }
      setSelectedIds(new Set());
      Swal.fire("Success", `${verb} completed.`, "success");
    } catch (error) {
      console.error("Bulk action error:", error);
      Swal.fire("Error", `Failed to ${verb} some users.`, "error");
    }
  };

  const handleBulkApply = () => {
    if (!bulkActionChoice || selectedIds.size === 0) return;
    bulkAction(bulkActionChoice);
  };

  const exportCsv = () => {
    if (filteredUsers.length === 0) return;
    const rows = filteredUsers.map((u) => ({
      ProfileID: buildProfileId(u),
      Name: u.fullName,
      Phone: u.phoneNumber,
      Premium: u.isPremium ? "Yes" : "No",
      Plan: getPlanLabel(u),
      SubscriptionStatus: getSubscriptionStatus(u).label,
      ExpiresAt: formatDate(u.subscription?.endDate || u.premiumExpiresAt),
      Approved: u.isApproved ? "Yes" : "No",
      Status: u.isBlocked ? "Blocked" : "Active",
    }));
    const header = Object.keys(rows[0]).join(",");
    const data = rows.map((r) => Object.values(r).join(",")).join("\n");
    const csv = `${header}\n${data}`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const pageSizeOptions = [10, 20, 50, 100];
  const effectivePageSize = pageSize;
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * effectivePageSize;
  const paginatedUsers = filteredUsers;
  const loadingSkeleton = (
    <div className="space-y-4 animate-pulse">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, idx) => (
          <div key={idx} className="h-20 rounded-xl bg-gray-100 dark:bg-gray-800" />
        ))}
      </div>
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-slate-900">
        <div className="mb-3 h-9 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="h-10 rounded-lg bg-gray-100 dark:bg-gray-800" />
        <div className="mt-4 space-y-2">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 rounded-lg bg-gray-100 dark:bg-gray-800" />
          ))}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return loadingSkeleton;
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Users", value: totalUsers, onClick: () => setSearchCriteria((p) => ({ ...p, premium: "", approval: "", status: "", searchTerm: "", searchBy: "name" })), cardBg: "from-emerald-50 via-white to-white dark:from-emerald-900/30 dark:via-slate-900 dark:to-slate-900", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-100" },
          { label: "Premium", value: premiumCount, onClick: () => setSearchCriteria((p) => ({ ...p, premium: "premium" })), cardBg: "from-amber-50 via-white to-white dark:from-amber-900/30 dark:via-slate-900 dark:to-slate-900", badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-100" },
          { label: "Pending Approval", value: pendingApprovals, onClick: () => setSearchCriteria((p) => ({ ...p, approval: "pending" })), cardBg: "from-sky-50 via-white to-white dark:from-sky-900/30 dark:via-slate-900 dark:to-slate-900", badge: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-100" },
          { label: "Blocked", value: blockedCount, onClick: () => setSearchCriteria((p) => ({ ...p, status: "blocked" })), cardBg: "from-rose-50 via-white to-white dark:from-rose-900/30 dark:via-slate-900 dark:to-slate-900", badge: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-100" },
        ].map((card) => (
          <button
            key={card.label}
            type="button"
            onClick={() => {
              card.onClick?.();
              setPage(1);
            }}
            className={`flex items-center justify-between rounded-xl border border-transparent bg-gradient-to-r ${card.cardBg} px-4 py-3 text-left shadow-sm ring-1 ring-gray-200/70 transition hover:-translate-y-[1px] hover:shadow-md dark:ring-gray-800/70`}
          >
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{card.label}</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">{card.value}</p>
            </div>
            <div
              className={`inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold ${
                card.label === "Total Users"
                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-100"
                  : card.badge
              }`}
            >
              Live
            </div>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-gray-800 dark:bg-slate-900">
        <div className="flex flex-col gap-2 border-b border-gray-200 p-4 dark:border-gray-800">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">All Users</h2>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">Rows:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  const next = Number(e.target.value) || 10;
                  setPageSize(next);
                  setPage(1);
                }}
                className="h-9 rounded-lg border px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex flex-1 min-w-[320px] items-center gap-1">
              <div className="flex gap-1 rounded-md bg-gray-100 p-1 dark:bg-gray-700">
                {[
                  { key: "name", label: "Name", icon: <User size={14} /> },
                  { key: "phone", label: "Phone", icon: <Phone size={14} /> },
                  { key: "id", label: "Profile ID", icon: <Fingerprint size={14} /> },
                ].map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setSearchCriteria((prev) => ({ ...prev, searchBy: mode.key }))}
                    className={`flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                      searchCriteria.searchBy === mode.key
                        ? "bg-white text-primary shadow-sm dark:bg-gray-800"
                        : "text-gray-600 hover:text-primary dark:text-gray-200"
                    }`}
                  >
                    {mode.icon}
                    {mode.label}
                  </button>
                ))}
              </div>
              <div className="relative flex-1 h-9 min-w-[220px]">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400" size={16} />
                <input
                  type="text"
                  name="searchTerm"
                  placeholder={`Search by ${
                    searchCriteria.searchBy === "name"
                      ? "name"
                      : searchCriteria.searchBy === "phone"
                        ? "phone"
                        : "profile ID"
                  }`}
                  value={searchCriteria.searchTerm}
                  onChange={handleSearchChange}
                  className="h-full w-full rounded-md border px-3 py-1.5 pl-9 text-sm focus:outline-none focus:ring-2 focus:ring-primary dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                name="premium"
                value={searchCriteria.premium}
                onChange={handleSearchChange}
                className="h-10 min-w-[130px] rounded-lg border border-gray-200 bg-gradient-to-r from-white to-gray-50 px-4 text-sm font-semibold text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">All Premium</option>
                <option value="premium">Premium</option>
                <option value="free">Free</option>
              </select>
              <select
                name="approval"
                value={searchCriteria.approval}
                onChange={handleSearchChange}
                className="h-10 min-w-[130px] rounded-lg border border-gray-200 bg-gradient-to-r from-white to-gray-50 px-4 text-sm font-semibold text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">All Approval</option>
                <option value="approved">Approved</option>
                <option value="pending">Not Approved</option>
              </select>
              <select
                name="status"
                value={searchCriteria.status}
                onChange={handleSearchChange}
                className="h-10 min-w-[130px] rounded-lg border border-gray-200 bg-gradient-to-r from-white to-gray-50 px-4 text-sm font-semibold text-gray-700 shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="blocked">Blocked</option>
              </select>
              <div className="ml-auto flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-2 py-1 shadow-sm dark:border-gray-700 dark:bg-gray-800">
                  <select
                    value={bulkActionChoice}
                    onChange={(e) => setBulkActionChoice(e.target.value)}
                    className="h-9 min-w-[140px] rounded-lg border border-gray-200 bg-gradient-to-r from-white to-gray-50 px-3 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  >
                    <option value="">Bulk actions</option>
                    <option value="approve">Approve</option>
                    <option value="block">Block</option>
                    <option value="unblock">Unblock</option>
                    <option value="delete">Delete</option>
                  </select>
                  <button
                    type="button"
                    onClick={handleBulkApply}
                    className="rounded-md bg-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                    disabled={selectedIds.size === 0 || !bulkActionChoice}
                  >
                    Apply
                  </button>
                </div>
                <button
                  type="button"
                  onClick={exportCsv}
                  className="inline-flex items-center gap-1 rounded-md border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  disabled={filteredUsers.length === 0}
                >
                  <Download size={12} /> CSV
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="card-body p-0">
          <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table text-sm">
            <thead className="table-header sticky top-0 z-10">
              <tr className="table-row">
                <th className="table-head text-xs w-8">
                  <input
                    type="checkbox"
                    checked={selectedIds.size === paginatedUsers.length && paginatedUsers.length > 0}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="table-head text-xs">#</th>
                <th className="table-head text-xs">Profile ID</th>
                <th className="table-head text-xs">Image</th>
                <th className="table-head text-xs">Name</th>
                <th className="table-head text-xs">Phone</th>
                <th className="table-head text-xs">Premium</th>
                <th className="table-head text-xs">Subscription</th>
                <th className="table-head text-xs">Approval</th>
                <th className="table-head text-xs">Status</th>
                <th className="table-head text-xs">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body text-[13px]">
                {filteredUsers.length > 0 ? (
                  paginatedUsers.map((user, index) => (
                    <tr key={user._id} className="table-row">
                    <td className="table-cell">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(user._id)}
                        onChange={() => toggleSelect(user._id)}
                      />
                    </td>
                    <td className="table-cell">{startIndex + index + 1}</td>
                    <td className="table-cell font-semibold text-gray-800 dark:text-gray-100" title={buildProfileId(user)}>
                      {buildProfileId(user)}
                    </td>
                    <td className="table-cell">
                      <div className="flex h-12 w-12 overflow-hidden rounded-full border">
                        <img
                          src={user?.photos?.[0] ? `${user.photos[0]}` : getAvatar(index)}
                          alt={user.fullName}
                          className="size-full rounded-sm object-cover"
                        />
                      </div>
                    </td>
                    <td className="table-cell font-medium text-gray-800 dark:text-gray-100">{user.fullName}</td>
                    <td className="table-cell text-gray-700 dark:text-gray-200">{user.phoneNumber}</td>
                    <td className="table-cell">
                      {user.isPremium ? (
                        <span className="rounded-full bg-purple-100 px-2 py-0.5 text-[11px] font-semibold text-purple-600">
                          Premium
                        </span>
                      ) : (
                        <span className="rounded-full bg-gray-200 px-2 py-0.5 text-[11px] font-semibold text-gray-600">
                          Free
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex flex-col gap-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                            {getPlanLabel(user)}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getSubscriptionStatus(user).tone}`}
                          >
                            {getSubscriptionStatus(user).label}
                          </span>
                        </div>
                        <span className="text-[11px] text-gray-500 dark:text-gray-400">
                          Ends {formatDate(user.subscription?.endDate || user.premiumExpiresAt)}
                        </span>
                        {user.subscription?.pausedUntil && (
                          <span className="text-[11px] text-amber-600">
                            Paused till {formatDate(user.subscription.pausedUntil)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => openSubscriptionDrawer(user)}
                          className="mt-1 inline-flex w-fit items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-semibold text-indigo-700 shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
                        >
                          <Crown size={12} />
                          Manage
                        </button>
                      </div>
                    </td>
                    <td className="table-cell">
                      {user.isApproved ? (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-600">
                          Approved
                        </span>
                      ) : (
                        <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[11px] font-semibold text-yellow-700">
                          Not Approved
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      {user.isBlocked ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-600">
                          Blocked
                        </span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-semibold text-green-600">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-x-3 text-[13px]">
                        <Link to={`/edit-user/${user._id}`} className="text-blue-500 hover:text-blue-700" title="Edit">
                            <FilePenLine size={18} />
                        </Link>
                        {user.isApproved !== true && (
                            <button
                                onClick={() => handleApprove(user._id)}
                                className="text-green-500 hover:text-green-700"
                                title="Approve"
                            >
                                <CheckCircle size={18} />
                            </button>
                        )}
                        <button
                          onClick={() => handleBlockToggle(user._id, user.isBlocked)}
                          className="text-gray-600 hover:text-primary"
                          title={user.isBlocked ? "Unblock User" : "Block User"}
                        >
                          {user.isBlocked ? <ShieldCheck size={18} /> : <ShieldOff size={18} />}
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete User"
                        >
                          <Trash size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td colSpan="12" className="table-cell text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3 p-4">
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Showing {filteredUsers.length === 0 ? 0 : startIndex + 1} -{" "}
              {Math.min(startIndex + effectivePageSize, filteredUsers.length)} of {filteredUsers.length}
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
          </div>
        </div>
      </div>

      {subscriptionDrawerOpen && activeSubscriptionUser && (() => {
        const modal = (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-md">
            <div className="flex w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4 dark:border-gray-800">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Subscription Manager
                </p>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {activeSubscriptionUser.fullName}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Admin-only control. No payment required from the user.
                </p>
              </div>
              <button
                type="button"
                onClick={closeSubscriptionDrawer}
                className="rounded-full border border-gray-200 p-2 text-gray-500 transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-4 overflow-y-auto px-5 py-4">
              <div className="grid gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-slate-800">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                    {getPlanLabel(activeSubscriptionUser)}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${getSubscriptionStatus(activeSubscriptionUser).tone}`}
                  >
                    {getSubscriptionStatus(activeSubscriptionUser).label}
                  </span>
                </div>
                <div className="grid gap-3 text-xs text-gray-600 dark:text-gray-300 sm:grid-cols-3">
                  <div className="flex items-center gap-2">
                    <Calendar size={14} className="text-gray-500" />
                    <span>
                      Ends: {formatDate(activeSubscriptionUser.subscription?.endDate || activeSubscriptionUser.premiumExpiresAt)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PauseCircle size={14} className="text-gray-500" />
                    <span>Paused till: {formatDate(activeSubscriptionUser.subscription?.pausedUntil)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ban size={14} className="text-gray-500" />
                    <span>Cancel on: {formatDate(activeSubscriptionUser.subscription?.cancelAt)}</span>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Admin Actions
                </p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { key: "assign", label: "Assign", icon: Crown, helper: "Grant a plan instantly" },
                    { key: "upgrade", label: "Upgrade", icon: ArrowUpRight, helper: "Move to higher plan" },
                    { key: "downgrade", label: "Downgrade", icon: ArrowDownRight, helper: "Move to lower plan" },
                    { key: "pause", label: "Pause", icon: PauseCircle, helper: "Temporarily stop access" },
                    { key: "extend", label: "Extend", icon: CalendarPlus, helper: "Add extra days" },
                    { key: "cancel", label: "Cancel", icon: Ban, helper: "End subscription" },
                  ].map((action) => {
                    const Icon = action.icon;
                    return (
                      <button
                        key={action.key}
                        type="button"
                        onClick={() => setSubscriptionForm((prev) => ({ ...prev, action: action.key }))}
                        className={`rounded-xl border px-3 py-3 text-left text-sm font-semibold shadow-sm transition hover:-translate-y-[1px] hover:shadow-md ${
                          subscriptionForm.action === action.key
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-gray-200 bg-white text-gray-700 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Icon size={16} />
                          {action.label}
                        </div>
                        <p className="mt-1 text-xs font-normal text-gray-500 dark:text-gray-400">{action.helper}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-slate-900">
                <div className="grid gap-3 sm:grid-cols-2">
                  {["assign", "upgrade", "downgrade"].includes(subscriptionForm.action) && (
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Plan
                      <select
                        value={subscriptionForm.planId}
                        onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, planId: e.target.value }))}
                        className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        <option value="">Select a plan</option>
                        {plans.map((plan) => (
                          <option key={plan._id} value={plan._id}>
                            {plan.name} - {plan.durationInDays} days
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {subscriptionForm.action === "extend" && (
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Extend by
                      <select
                        value={subscriptionForm.extendDays}
                        onChange={(e) =>
                          setSubscriptionForm((prev) => ({ ...prev, extendDays: e.target.value }))
                        }
                        className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        <option value="7">7 days</option>
                        <option value="30">30 days</option>
                        <option value="90">90 days</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  )}

                  {subscriptionForm.action === "pause" && (
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Pause for
                      <select
                        value={subscriptionForm.pauseDays}
                        onChange={(e) =>
                          setSubscriptionForm((prev) => ({ ...prev, pauseDays: e.target.value }))
                        }
                        className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        <option value="7">7 days</option>
                        <option value="14">14 days</option>
                        <option value="30">30 days</option>
                        <option value="custom">Custom</option>
                      </select>
                    </label>
                  )}

                  {subscriptionForm.action === "cancel" && (
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Cancellation mode
                      <select
                        value={subscriptionForm.cancelMode}
                        onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, cancelMode: e.target.value }))}
                        className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="end_of_cycle">End of cycle</option>
                      </select>
                    </label>
                  )}

                  {((subscriptionForm.action === "extend" && subscriptionForm.extendDays === "custom") ||
                    (subscriptionForm.action === "pause" && subscriptionForm.pauseDays === "custom")) && (
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Custom days
                      <input
                        type="number"
                        min="1"
                        value={subscriptionForm.customDays}
                        onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, customDays: e.target.value }))}
                        className="mt-1 h-10 w-full rounded-lg border border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                        placeholder="e.g. 21"
                      />
                    </label>
                  )}

                  <label className="sm:col-span-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Internal note
                    <textarea
                      value={subscriptionForm.note}
                      onChange={(e) => setSubscriptionForm((prev) => ({ ...prev, note: e.target.value }))}
                      className="mt-1 min-h-[80px] w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                      placeholder="Log why this change was made."
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-gray-200 px-5 py-4 dark:border-gray-800">
              <button
                type="button"
                onClick={closeSubscriptionDrawer}
                className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 hover:border-primary hover:text-primary dark:border-gray-700 dark:text-gray-300"
              >
                Close
              </button>
              <button
                type="button"
                onClick={applySubscriptionAction}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-[1px] hover:shadow-md"
              >
                Apply Changes
              </button>
            </div>
          </div>
          </div>
        );
        if (!portalReady || typeof document === "undefined" || !document.body) {
          return modal;
        }
        return createPortal(modal, document.body);
      })()}
    </div>
  );
};

export default ManageUser;


