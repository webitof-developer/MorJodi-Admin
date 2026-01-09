import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaSearch, FaTimes } from "react-icons/fa";

const SelectionModal = ({
    isOpen,
    onClose,
    title,
    options,
    onSelect,
    selectedValue,
    onRequestNew
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
        if (!isOpen) {
            setSearchTerm("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const filteredOptions = options.filter(opt =>
        (opt.name || opt.label || opt.toString()).toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => {
        const valA = a.value || a._id || a;
        const valB = b.value || b._id || b;
        const isASelected = selectedValue === valA;
        const isBSelected = selectedValue === valB;
        if (isASelected === isBSelected) return 0;
        return isASelected ? -1 : 1;
    });

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">

                {/* Header */}
                <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">{title}</h3>
                    <div className="flex items-center gap-2">
                        {onRequestNew && (
                            <button
                                type="button"
                                onClick={onRequestNew}
                                className="bg-red-50 text-red-500 text-xs font-bold px-3 py-1.5 rounded-full hover:bg-red-100 transition"
                            >
                                + Request New
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
                        >
                            <FaTimes />
                        </button>
                    </div>
                </div>

                {/* Search */}
                <div className="p-4 pb-2">
                    <div className="relative">
                        <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A52A2A]/20 focus:border-[#A52A2A] transition text-sm"
                        />
                    </div>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-2">
                    {filteredOptions.length > 0 ? (
                        <div className="space-y-1">
                            {filteredOptions.map((option) => {
                                const val = option.value || option._id || option;
                                const label = option.name || option.label || option;
                                const isSelected = selectedValue === val;

                                return (
                                    <button
                                        key={val}
                                        type="button"
                                        onClick={() => { onSelect(val); onClose(); }}
                                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition group text-left ${isSelected ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                                    >
                                        <span className={`text-sm font-medium ${isSelected ? 'text-[#A52A2A]' : 'text-gray-700'}`}>
                                            {label}
                                        </span>
                                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-[#A52A2A] bg-[#A52A2A]' : 'border-gray-300 group-hover:border-gray-400'}`}>
                                            {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-10 text-center text-gray-400 text-sm">
                            No results found
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

const FloatingSelect = ({
    label,
    value,
    onChange,
    options = [],
    required = false,
    className = "",
    onRequestNew, // Optional callback if "Request New" feature is needed per field
}) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Find display label for selected value
    const selectedOption = options.find(opt => (opt.value || opt._id || opt) === value);
    const displayValue = selectedOption ? (selectedOption.name || selectedOption.label || selectedOption) : "";

    const hasValue = displayValue !== "" && displayValue !== null;

    // Mock Request New if not provided (or leave null to hide button)
    const handleRequestNew = onRequestNew || null;

    return (
        <>
            <div
                className={`relative cursor-pointer ${className}`}
                onClick={() => setIsModalOpen(true)}
            >
                <div className={`
          block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-xl border border-gray-300 
          ${isModalOpen ? 'border-[#A52A2A] ring-1 ring-[#A52A2A]' : ''}
        `}>
                    <span className={`block truncate ${!hasValue ? 'text-transparent' : ''}`}>
                        {hasValue ? displayValue : "placeholder"}
                    </span>
                </div>

                <label
                    className={`
            absolute duration-300 transform origin-[0] bg-white px-1 left-3 pointer-events-none z-10
            ${hasValue || isModalOpen
                            ? "text-xs -translate-y-3 scale-90 top-1.5 text-[#A52A2A]"
                            : "text-sm -translate-y-1/2 scale-100 top-1/2 text-gray-500"
                        }
          `}
                >
                    {label} {required && <span className="text-red-500">*</span>}
                </label>

                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                    <FaChevronDown className="w-3 h-3 text-gray-400" />
                </div>
            </div>

            <SelectionModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={label}
                options={options}
                selectedValue={value}
                onSelect={(val) => {
                    // Create a fake event object to maintain compatibility with standard onChange handlers
                    const event = { target: { value: val, name: label } };
                    onChange(event);
                }}
                onRequestNew={handleRequestNew}
            />
        </>
    );
};

export default FloatingSelect;
