import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Save, Lock, Globe, CreditCard, BarChart2, Mail, Key } from 'lucide-react';
import API_BASE_URL from '../../components/Config';

const GeneralSettings = () => {
    const [settings, setSettings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('general');
    const [uploadingKeyfile, setUploadingKeyfile] = useState(false);
    const token = localStorage.getItem('authToken');

    const groups = [
        { id: 'general', label: 'General', icon: <Globe size={18} /> },
        { id: 'payment', label: 'Payment', icon: <CreditCard size={18} /> },
        { id: 'analytics', label: 'Analytics', icon: <BarChart2 size={18} /> },
        { id: 'email', label: 'Email (SMTP)', icon: <Mail size={18} /> },
        { id: 'auth', label: 'Authentication', icon: <Key size={18} /> },
        { id: 'cloud', label: 'Cloud Services', icon: <Globe size={18} /> },
        { id: 'social', label: 'Social Media', icon: <Globe size={18} /> },
    ];

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await axios.get(`${API_BASE_URL}/api/settings/admin`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // Ensure we have an array, or default to empty
            // Ensure we have an array, or default to empty
            const fetched = res.data || [];

            // Merge with default structure for Analytics to ensure fields are visible
            const analyticsDefaults = [
                { key: 'GA_TRACKING_ID', group: 'analytics', value: '', isPrivate: false, isEnabled: true },
                { key: 'FACEBOOK_APP_ID', group: 'analytics', value: '', isPrivate: false, isEnabled: true },
                { key: 'FACEBOOK_PIXEL_ID', group: 'analytics', value: '', isPrivate: false, isEnabled: true },
            ];

            const mergedSettings = [...fetched];
            analyticsDefaults.forEach(def => {
                if (!mergedSettings.find(s => s.key === def.key)) {
                    mergedSettings.push(def);
                }
            });

            setSettings(mergedSettings);
        } catch (error) {
            console.error("Error fetching settings:", error);
            // toast.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (key, field, value) => {
        setSettings(prev => {
            const existingIndex = prev.findIndex(s => s.key === key);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex] = { ...updated[existingIndex], [field]: value };
                return updated;
            } else {
                // Add new local setting entry if it doesn't exist yet (for dynamic forms)
                // This part requires knowing the group, so mostly we update existing or pre-defined list.
                return prev;
            }
        });
    };

    // Helper to update a setting or create it if missing in local state
    const updateOrAddSetting = (key, group, value, isPrivate = false) => {
        setSettings(prev => {
            const index = prev.findIndex(s => s.key === key);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = { ...updated[index], value, group, isPrivate };
                return updated;
            }
            return [...prev, { key, group, value, isPrivate, isEnabled: true }];
        });
    };

    const getSetting = (key) => settings.find(s => s.key === key) || { value: '' };

    const uploadKeyfile = async (file) => {
        setUploadingKeyfile(true);
        try {
            const formData = new FormData();
            formData.append('keyfile', file);

            await axios.post(`${API_BASE_URL}/api/settings/upload-keyfile`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });

            Swal.fire('Success', 'Keyfile uploaded successfully', 'success');
            fetchSettings(); // Refresh settings
        } catch (error) {
            console.error("Error uploading keyfile:", error);
            Swal.fire('Error', 'Failed to upload keyfile', 'error');
        } finally {
            setUploadingKeyfile(false);
        }
    };

    const handleSave = async () => {
        try {
            // Filter out settings that belong to the current tab? Or save all? 
            // Saving all is safer to avoid state desync.
            await axios.put(`${API_BASE_URL}/api/settings/admin`, { settings }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            Swal.fire('Success', 'Settings saved successfully', 'success');
        } catch (error) {
            console.error("Error saving settings:", error);
            Swal.fire('Error', 'Failed to save settings', 'error');
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">General Settings</h1>

            <div className="flex flex-col md:flex-row gap-6">
                {/* Sidebar / Tabs */}
                <div className="w-full md:w-64 flex-shrink-0">
                    <div className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
                        {groups.map(group => (
                            <button
                                key={group.id}
                                onClick={() => setActiveTab(group.id)}
                                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors ${activeTab === group.id
                                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-r-4 border-blue-500'
                                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                    }`}
                            >
                                {group.icon}
                                <span className="font-medium">{group.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1">
                    <div className="bg-[#f8f9fa] shadow-sm dark:bg-gray-800 rounded-xl shadow-sm p-6">
                        {loading ? (
                            <div className="flex justify-center items-center py-12">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                            </div>
                        ) : (
                            <>
                                <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white capitalize">
                                    {activeTab} Settings
                                </h2>

                                {settings
                                    .filter(s => s.group === activeTab)
                                    .map(setting => {
                                        const isLargeText = setting.key.includes('KEYFILE') || setting.key.includes('CREDENTIALS');
                                        const isFileUpload = setting.key === 'GCP_KEYFILE' || setting.key === 'GOOGLE_APPLICATION_CREDENTIALS';

                                        return (
                                            <div key={setting.key} className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                    {setting.key.replace(/_/g, ' ')}
                                                    {setting.isPrivate && <Lock size={12} className="inline ml-1 text-red-400" />}
                                                </label>

                                                {isLargeText ? (
                                                    <textarea
                                                        value={setting.value || ''}
                                                        onChange={(e) => updateOrAddSetting(setting.key, setting.group, e.target.value, setting.isPrivate)}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                                                        placeholder={`Paste JSON content or file path`}
                                                        rows={6}
                                                    />
                                                ) : (
                                                    <input
                                                        type={setting.isPrivate ? 'password' : 'text'}
                                                        value={setting.value || ''}
                                                        onChange={(e) => updateOrAddSetting(setting.key, setting.group, e.target.value, setting.isPrivate)}
                                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-[#f8f9fa] shadow-sm dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                                                        placeholder={`Enter ${setting.key.replace(/_/g, ' ').toLowerCase()}`}
                                                    />
                                                )}

                                                {isFileUpload && (
                                                    <>
                                                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                            💡 Tip: Paste the JSON content directly or upload a file
                                                        </p>
                                                        <input
                                                            type="file"
                                                            accept=".json"
                                                            onChange={(e) => {
                                                                const file = e.target.files[0];
                                                                if (file) {
                                                                    uploadKeyfile(file);
                                                                }
                                                            }}
                                                            className="mt-2 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                            disabled={uploadingKeyfile}
                                                        />
                                                        {uploadingKeyfile && (
                                                            <p className="mt-1 text-xs text-blue-600">Uploading...</p>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        );
                                    })}

                                {settings.filter(s => s.group === activeTab).length === 0 && (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                                        No settings found for this category. Settings will be auto-created from .env on server startup.
                                    </p>
                                )}

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={handleSave}
                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/30"
                                    >
                                        <Save size={20} />
                                        Save Changes
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GeneralSettings;
