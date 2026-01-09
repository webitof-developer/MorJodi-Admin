import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "/src/utils/swalTheme";
import API_BASE_URL from "../../components/Config";

const IdManagement = () => {
  const token = localStorage.getItem("authToken");
  const [prefix, setPrefix] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPrefix = async () => {
      try {
        const { data } = await axios.get(`${API_BASE_URL}/api/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (Array.isArray(data)) {
          const setting =
            data.find(s => s.key === "profile_id_prefix") ||
            data.find(s => s.key === "profile_prefix");
          if (setting?.value) setPrefix(setting.value);
        }
      } catch (error) {
        Swal.fire("Error!", "Failed to load ID prefix", "error");
      }
    };
    fetchPrefix();
  }, [token]);

  const sampleId = `${(prefix || "MJ").toUpperCase()}HK56120`;

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `${API_BASE_URL}/api/settings`,
        {
          settings: [
            {
              key: "profile_id_prefix",
              value: prefix.toUpperCase(),
            },
          ],
        },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      Swal.fire("Success!", "Profile ID prefix updated.", "success");
    } catch (error) {
      Swal.fire("Error!", "Failed to update prefix", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-2">
    
      <div className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
      
           <form onSubmit={handleSubmit} className="mt-8 mt-2 space-y-4">
          <div>
             <h2 className="text-2xl font-semibold mt-3 mb-3  text-gray-900 dark:text-white">
           Profile ID Prefix Setting
        </h2>

            <input
              type="text"
              maxLength={4}
              value={prefix}
              onChange={e => setPrefix(e.target.value)}
              className="w-full px-4 py-2 border rounded-md dark:bg-gray-700 dark:text-white"
              placeholder="MJ"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-40 bg-primary text-white py-2 rounded-md hover:bg-opacity-90 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Prefix"}
          </button>
        </form>

        <h4 className="text-2xl font-semibold mt-2  text-gray-900 dark:text-white">
          User Profile ID Format
        </h4>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
          Configure how system-generated user profile IDs are structured.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-4 py-3">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-200 bg-[#f8f9fa] shadow-sm dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2">
            &lt;PREFIX&gt;
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-200 bg-[#f8f9fa] shadow-sm dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2">
            &lt;INITIALS&gt;
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-200 bg-[#f8f9fa] shadow-sm dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2">
            &lt;SEQ&gt;
          </span>
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-200 bg-[#f8f9fa] shadow-sm dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2">
            &lt;DOB&gt;
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              PREFIX
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">MJ, MK, CG</p>
          </div>
          <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              INITIALS
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              First + last name initials
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              SEQUENCE
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              3 digit stable number
            </p>
          </div>
          <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              DOB DAY
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Day of birth (2 digits)
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="w-full bg-[#0F1324] text-white rounded-2xl px-6 py-5 flex items-center">
            <div className="bg-[#050714] px-4 py-2 rounded-lg text-2xl font-bold tracking-wide">
              {sampleId}
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-md font-semibold text-gray-900 dark:text-white">
            How the ID is Generated
          </h3>
          <ul className="mt-3 space-y-2 text-sm text-gray-700 dark:text-gray-300 list-disc list-inside">
            <li>Set the prefix used to generate user profile IDs (e.g., MJ, MK, CG).</li>
            <li>
              <strong>Format:</strong>{" "}
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                &lt;PREFIX&gt;&lt;INITIALS&gt;&lt;3-digit sequence&gt;&lt;DOB day&gt;
              </code>
            </li>
            <li>
              <strong>PREFIX:</strong> Set in <em>ID Management</em> (e.g., MJ, MK).
            </li>
            <li>
              <strong>INITIALS:</strong> First letter of first name + first letter of last name. If no
              last name, use second letter of first name.
            </li>
            <li>
              <strong>3-digit sequence:</strong> Stable number from user record (profileNumber /
              sequenceNumber / serialNumber / profileCode if available; otherwise derived from user
              ID), padded to 3 digits.
            </li>
            <li>
              <strong>DOB day:</strong> Day of birth only, padded to 2 digits.
            </li>
            <li>
              <strong>Example:</strong> For user "Hitesh Kumar" with profile number 561 and DOB
              1999-08-20, and prefix "MJ", the ID is{" "}
              <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                MJHK56120
              </code>
              .
            </li>
          </ul>
        </div>

       
      </div>
    </div>
  );
};

export default IdManagement;


