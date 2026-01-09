import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../../components/Config';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { IconArrowLeft, IconDeviceFloppy } from '@tabler/icons-react';
import { Link, useNavigate, useParams } from 'react-router-dom';

const AddNotice = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = !!id;
    const token = localStorage.getItem("authToken");

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        actionLabel: 'Take Action',
        remindLabel: 'Remind Later',
        isForced: false,
        status: 'draft',
        targetRules: {
            gender: 'All',
            membershipType: 'All',
            profileStatus: 'All',
            missingFields: [],
            isBlocked: false
        },
        actionLink: {
            screen: 'EditProfile',
            params: '{}'
        }
    });

    // Helper for Missing Fields Checkboxes
    const missingFieldOptions = [
        { label: 'Profile Image', value: 'image' },
        { label: 'Aadhaar Card', value: 'aadhaar' },
        { label: 'PAN Card', value: 'pan' },
        { label: 'Family Details', value: 'family' },
        { label: 'Location', value: 'location' },
    ];

    useEffect(() => {
        if (isEdit) {
            fetchNotice();
        }
    }, [id]);

    const fetchNotice = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/notice/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Admin "list" endpoint returns all. Ideally we have a "get single" endpoint.
            // But controller didn't have "getOne". I'll use list and find locally or add getOne.
            // List is cheap enough for now.
            const found = res.data.find(n => n._id === id);
            if (found) {
                setFormData({
                    ...found,
                    targetRules: {
                        ...found.targetRules,
                        missingFields: found.targetRules.missingFields || []
                    },
                    actionLink: {
                        screen: found.actionLink.screen,
                        params: JSON.stringify(found.actionLink.params || {})
                    }
                });
            }
        } catch (error) {
            toast.error("Failed to fetch notice details");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleRuleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            targetRules: { ...prev.targetRules, [field]: value }
        }));
    };

    const handleMissingFieldToggle = (value) => {
        setFormData(prev => {
            const current = prev.targetRules.missingFields;
            if (current.includes(value)) {
                return {
                    ...prev,
                    targetRules: { ...prev.targetRules, missingFields: current.filter(f => f !== value) }
                };
            } else {
                return {
                    ...prev,
                    targetRules: { ...prev.targetRules, missingFields: [...current, value] }
                };
            }
        });
    };

    const handleActionChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            actionLink: { ...prev.actionLink, [field]: value }
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            // Parse params
            let parsedParams = {};
            try {
                parsedParams = JSON.parse(formData.actionLink.params);
            } catch (err) {
                toast.error("Invalid JSON in Action Params");
                setLoading(false);
                return;
            }

            const payload = {
                ...formData,
                actionLink: {
                    screen: formData.actionLink.screen,
                    params: parsedParams
                }
            };

            if (isEdit) {
                await axios.put(`${API_BASE_URL}/api/notice/${id}`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Notice updated");
            } else {
                await axios.post(`${API_BASE_URL}/api/notice`, payload, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                toast.success("Notice created");
            }
            navigate('/notices/list');
        } catch (error) {
            toast.error(error.response?.data?.message || "Operation failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-[#f8f9fa] min-h-screen font-sans text-slate-800">
            <ToastContainer />
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-4 mb-6">
                    <Link to="/notices/list" className="p-2 bg-white rounded-full shadow-sm text-gray-600 hover:text-primary transition">
                        <IconArrowLeft size={20} />
                    </Link>
                    <h1 className="text-2xl font-bold">{isEdit ? 'Edit Notice' : 'Create New Notice'}</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Basic Details</h3>
                        <div>
                            <label className="block text-sm font-medium mb-1">Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleChange} required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Upload your Aadhaar" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} required rows="3" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" placeholder="Message content..." />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Action Button Label</label>
                                <input type="text" name="actionLabel" value={formData.actionLabel} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Remind Button Label</label>
                                <input type="text" name="remindLabel" value={formData.remindLabel} onChange={handleChange} className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-primary outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Status</label>
                            <select name="status" value={formData.status} onChange={handleChange} className="w-full p-2 border rounded-lg bg-gray-50">
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                name="isForced"
                                id="isForced"
                                checked={formData.isForced}
                                onChange={handleChange}
                                className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                            />
                            <label htmlFor="isForced" className="text-sm font-medium text-gray-700">Force Action (Cannot be dismissed)</label>
                        </div>
                    </div>

                    {/* Targeting Rules */}
                    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Targeting Rules</h3>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Gender</label>
                                <select value={formData.targetRules.gender} onChange={(e) => handleRuleChange('gender', e.target.value)} className="w-full p-2 border rounded-lg">
                                    <option value="All">All Users</option>
                                    <option value="Male">Male Only</option>
                                    <option value="Female">Female Only</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Membership</label>
                                <select value={formData.targetRules.membershipType} onChange={(e) => handleRuleChange('membershipType', e.target.value)} className="w-full p-2 border rounded-lg">
                                    <option value="All">All Types</option>
                                    <option value="Free">Free Members</option>
                                    <option value="Premium">Premium Members</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Profile Status</label>
                                <select value={formData.targetRules.profileStatus} onChange={(e) => handleRuleChange('profileStatus', e.target.value)} className="w-full p-2 border rounded-lg">
                                    <option value="All">All statuses</option>
                                    <option value="Incomplete">Incomplete Profiles</option>
                                    <option value="Completed">Completed Profiles</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Target Missing Documents/Fields</label>
                            <div className="flex flex-wrap gap-3">
                                {missingFieldOptions.map((opt) => (
                                    <label key={opt.value} className={`cursor-pointer px-4 py-2 rounded-full border text-sm transition ${formData.targetRules.missingFields.includes(opt.value)
                                        ? 'bg-primary/10 border-primary text-primary font-semibold'
                                        : 'bg-gray-50 border-gray-200 text-gray-600'
                                        }`}>
                                        <input
                                            type="checkbox"
                                            className="hidden"
                                            checked={formData.targetRules.missingFields.includes(opt.value)}
                                            onChange={() => handleMissingFieldToggle(opt.value)}
                                        />
                                        {opt.label}
                                    </label>
                                ))}
                            </div>
                            <p className="text-xs text-gray-400 mt-2">* Notice will be shown if user matches criteria and is missing ANY selected field (if checked).</p>
                        </div>
                    </div>

                    {/* Action Link */}
                    <div className="bg-white p-6 rounded-xl shadow-sm space-y-4">
                        <h3 className="text-lg font-semibold border-b pb-2 mb-4">Action Redirection</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium mb-1">Target Screen</label>
                                <select value={formData.actionLink.screen} onChange={(e) => handleActionChange('screen', e.target.value)} className="w-full p-2 border rounded-lg">
                                    <option value="EditProfile">Edit Profile (General)</option>
                                    <option value="Upgrade">Membership Plans</option>
                                    <option value="EditProfile">Document Upload</option>
                                    <option value="Home">Home Screen</option>
                                    <option value="Matches">Matches</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Params (JSON Format)</label>
                                <input
                                    type="text"
                                    value={formData.actionLink.params}
                                    onChange={(e) => handleActionChange('params', e.target.value)}
                                    className="w-full p-2 border rounded-lg font-mono text-xs"
                                    placeholder='{"section": "Aadhaar"}'
                                />
                                <div className="text-xs text-gray-400 mt-1">
                                    Example: {`{"section": "Aadhaar"}`} or {`{}`}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-lg shadow-lg flex items-center gap-2 transform active:scale-95 transition"
                        >
                            <IconDeviceFloppy size={20} />
                            {isEdit ? 'Update Notice' : 'Publish Notice'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );
};

export default AddNotice;
