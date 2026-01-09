import React, { useState, useEffect, useRef } from "react";
import { FaChevronDown, FaSearch, FaTimes, FaCheck } from "react-icons/fa";

const MultiSelectionModal = ({
  isOpen,
  onClose,
  title,
  options,
  onToggleSelect,
  selectedValues,
  labelField = "name",
  valueField = "_id"
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
    (opt[labelField] || "").toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    const isASelected = selectedValues.includes(a[valueField]);
    const isBSelected = selectedValues.includes(b[valueField]);
    if (isASelected === isBSelected) return 0;
    return isASelected ? -1 : 1;
  });

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-slide-up">

        {/* Header */}
        <div className="px-6 py-4 flex items-center justify-between border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition"
          >
            <FaTimes />
          </button>
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
                const val = option[valueField];
                const label = option[labelField];
                const isSelected = selectedValues.includes(val);

                return (
                  <button
                    key={val}
                    type="button"
                    onClick={() => onToggleSelect(val)}
                    className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl transition group text-left ${isSelected ? 'bg-red-50' : 'hover:bg-gray-50'}`}
                  >
                    <span className={`text-sm font-medium ${isSelected ? 'text-[#A52A2A]' : 'text-gray-700'}`}>
                      {label}
                    </span>
                    <div className={`w-5 h-5 rounded flex items-center justify-center border transition ${isSelected ? 'border-[#A52A2A] bg-[#A52A2A]' : 'border-gray-300'}`}>
                      {isSelected && <FaCheck className="text-white text-[10px]" />}
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

const ModernMultiSelect = ({
  label,
  data = [],
  value = [],
  onChange,
  labelField = "name",
  valueField = "value",
  placeholder = "Select...",
  required = false
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Create display value (chips)
  const hasValue = value.length > 0;

  const toggleSelect = (val) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const removeItem = (e, val) => {
    e.stopPropagation();
    onChange(value.filter((v) => v !== val));
  };

  return (
    <>
      <div
        className="relative cursor-pointer mb-1"
        onClick={() => setIsModalOpen(true)}
      >
        <div className={`
          block px-3 pb-2 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-xl border border-gray-300 min-h-[50px]
          ${isModalOpen ? 'border-[#A52A2A] ring-1 ring-[#A52A2A]' : ''}
        `}>
          <div className="flex flex-wrap gap-1.5 ">
            {hasValue ? (
              value.map((val) => {
                const item = data.find(d => d[valueField] === val);
                const display = item ? item[labelField] : val;
                return (
                  <span key={val} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-red-50 text-[#A52A2A]">
                    {display}
                    <button onClick={(e) => removeItem(e, val)} className="ml-1 text-red-500 hover:text-red-700"><FaTimes /></button>
                  </span>
                )
              })
            ) : (
              <span className="text-transparent">Placeholder</span>
            )}
          </div>
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

        <div className="absolute top-4 right-3 pointer-events-none">
          <FaChevronDown className="w-3 h-3 text-gray-400" />
        </div>
      </div>

      <MultiSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={label}
        options={data}
        selectedValues={value}
        onToggleSelect={toggleSelect}
        labelField={labelField}
        valueField={valueField}
      />
    </>
  );
};

export default ModernMultiSelect;
