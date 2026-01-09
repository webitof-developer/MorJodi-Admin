import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Swal from "sweetalert2";
import API_BASE_URL from "../../components/Config";
import { IconCheck, IconX, IconEdit, IconPencil } from "@tabler/icons-react";

const ManageRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem("authToken");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/data-request`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setRequests(res.data.requests);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = async (req) => {
        const { value: newName } = await Swal.fire({
            title: "Edit Name",
            input: "text",
            inputLabel: "Correct the name",
            inputValue: req.name,
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) {
                    return "You need to write something!";
                }
            }
        });

        if (newName && newName !== req.name) {
            try {
                const res = await axios.put(`${API_BASE_URL}/api/data-request/${req._id}`, {
                    name: newName
                }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data.success) {
                    Swal.fire("Updated", "Request name updated.", "success");
                    fetchRequests();
                }
            } catch (err) {
                Swal.fire("Error", err.response?.data?.message || "Update failed", "error");
            }
        }
    };

    const handleApprove = async (req) => {
        // Allow admin to verify/correct name before approving
        const { value: confirmedName } = await Swal.fire({
            title: "Approve Request",
            text: "Verify the name before adding to database:",
            input: "text",
            inputValue: req.name,
            showCancelButton: true,
            confirmButtonText: "Approve & Add",
            inputValidator: (value) => {
                if (!value) return "Name is required!";
            }
        });

        if (confirmedName) {
            handleAction(req._id, 'approve', null, confirmedName);
        }
    };

    const handleAction = async (id, action, reason = null, correctedName = null) => {
        // If rejecting and no reason passed yet, ask for it
        if (action === 'reject' && !reason) {
            const { value: text } = await Swal.fire({
                input: 'textarea',
                inputLabel: 'Rejection Reason',
                inputPlaceholder: 'Type your reason here...',
                showCancelButton: true
            });
            if (!text) return; // Cancelled
            reason = text;
        }

        try {
            const payload = { action };
            if (reason) payload.rejectionReason = reason;
            if (correctedName) payload.correctedName = correctedName;

            const res = await axios.put(`${API_BASE_URL}/api/data-request/${id}/action`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                Swal.fire("Success", res.data.message, "success");
                fetchRequests();
            }
        } catch (err) {
            Swal.fire("Error", err.response?.data?.message || "Action failed", "error");
        }
    };

    if (loading) return <div className="p-4">Loading...</div>;

    return (
        <div className="card">
            <div className="card-header flex justify-between items-center p-4 border-b">
                <h2 className="text-xl font-semibold">Manage Data Requests</h2>
            </div>
            <div className="card-body p-0 overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b">
                        <tr>
                            <th className="p-4 text-sm font-medium text-gray-500">Requested Type</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Name</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Parent</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Requested By</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Status</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Date</th>
                            <th className="p-4 text-sm font-medium text-gray-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {requests.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="p-4 text-center text-gray-500">No requests found</td>
                            </tr>
                        ) : (
                            requests.map((req) => (
                                <tr key={req._id} className="border-b hover:bg-gray-50">
                                    <td className="p-4 capitalize">{req.type}</td>
                                    <td className="p-4 font-medium">{req.name}</td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {req.parentName !== 'N/A' ? (
                                            <span className="font-medium text-gray-800">{req.parentName}</span>
                                        ) : (
                                            req.parentId ? <span className="text-xs text-gray-400">ID: {req.parentId}</span> : '-'
                                        )}
                                        {req.parentType && <div className="text-xs text-gray-400 uppercase">{req.parentType}</div>}
                                    </td>
                                    <td className="p-4 text-sm text-gray-600">
                                        {req.requestedById ? (
                                            <Link to={`/admin/users/${req.requestedById}`} className="hover:underline text-blue-600 block">
                                                <div className="font-medium">{req.requestedByName}</div>
                                                <div className="text-xs text-gray-500">{req.requestedByMobile}</div>
                                            </Link>
                                        ) : (
                                            '-'
                                        )}
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold 
                                            ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-800'
                                                : req.status === 'approved' ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'}`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {new Date(req.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="p-4 flex gap-2">
                                        {req.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleApprove(req)}
                                                    className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200"
                                                    title="Approve"
                                                >
                                                    <IconCheck size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(req)}
                                                    className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
                                                    title="Edit Name"
                                                >
                                                    <IconPencil size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleAction(req._id, 'reject')}
                                                    className="p-1 bg-red-100 text-red-600 rounded hover:bg-red-200"
                                                    title="Reject"
                                                >
                                                    <IconX size={18} />
                                                </button>
                                            </>
                                        )}
                                        {req.status === 'rejected' && (
                                            <span className="text-xs text-red-600 max-w-xs truncate" title={req.rejectionReason}>
                                                Reason: {req.rejectionReason}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageRequests;
