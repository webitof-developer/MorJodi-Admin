import React, { useState, useEffect } from "react";
import axios from "axios";
import { Trash, Search, PlusCircle, Scale, Edit } from "lucide-react";
import Swal from "sweetalert2";
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
      setPlans(response.data);
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

  if (loading) {
    return <div>Loading Plans...</div>;
  }

  return (
    <div className="card">
      <div className="card-header flex justify-between items-center p-4">
        <h2 className="text-lg font-semibold dark:text-white flex items-center gap-2">
          <Scale size={20} /> Manage Plans
        </h2>
        <div className="flex gap-4 items-center">
          <div className="relative">
            <input
              type="text"
              placeholder="Search Plan"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 text-gray-900 dark:text-gray-100"
            />
            <Search
              className="absolute left-3 top-3 text-gray-500 dark:text-gray-400"
              size={18}
            />
          </div>
          <Link
            to="/addplan"
            className="border px-4 py-2 rounded-md flex items-center gap-2 
                       hover:bg-gray-100 dark:hover:bg-gray-700 
                       text-gray-800 dark:text-white "
          >
            <PlusCircle size={18} /> Add Plan
          </Link>
        </div>
      </div>

      <div className="card-body p-0">
        <div className="relative h-auto w-full flex-shrink-0 overflow-auto rounded-none [scrollbar-width:_thin]">
          <table className="table">
            <thead className="table-header">
              <tr className="table-row">
                <th className="table-head">#</th>
                <th className="table-head">Plan Name</th>
                <th className="table-head">Price</th>
                <th className="table-head">Duration</th>
                <th className="table-head">Features</th>
                <th className="table-head">Status</th>
                <th className="table-head">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {filteredPlans.length > 0 ? (
                filteredPlans.map((plan, index) => (
                  <tr key={plan._id} className="table-row">
                    <td className="table-cell">{index + 1}</td>
                    <td className="table-cell">{plan.name} {plan.isFree && <span className='text-xs text-green-500'>(Free)</span>}</td>
                    <td className="table-cell">{plan.isFree ? 'Free' : `₹${plan.price}`}</td>
                    <td className="table-cell">{plan.durationInDays} days</td>
                    <td className="table-cell text-sm">
                      {plan.features && plan.features.length > 0 ? (
                        <ul className="list-disc list-inside space-y-1">
                          {plan.features.map((f, i) => (
                            <li key={i} className="text-gray-700 dark:text-gray-300">
                              {f.name} {f.limit > 0 ? `(${f.limit} per day)` : "(Unlimited)"}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <span className="text-gray-400 italic">No features added</span>
                      )}
                    </td>
                    <td className="table-cell">
                      {plan.isActive ? (
                        <span className="px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                          Active
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold text-red-700 bg-red-100 rounded-full">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="table-cell">
                      <div className="flex gap-2">
                        <Link to={`/editplan/${plan._id}`} title="Edit Plan">
                          <Edit
                            size={20}
                            className="text-blue-500 hover:text-blue-700"
                          />
                        </Link>
                        <button
                          onClick={() => handleDelete(plan._id)}
                          className={`text-red-500 hover:text-red-700 ${plan.isFree && 'opacity-50 cursor-not-allowed'}`}
                          title="Delete Plan"
                          disabled={plan.isFree}
                        >
                          <Trash size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr className="table-row">
                  <td
                    colSpan="7"
                    className="table-cell text-center text-gray-500"
                  >
                    No Plans found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePlans;
