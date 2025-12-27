import React, { useState, useEffect, useRef } from "react";

const ModernMultiSelect = ({
  label,
  data = [],
  value = [],
  onChange,
  labelField = "name",
  valueField = "value",
  placeholder = "Select options...",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Toggle selection
  const toggleSelect = (val) => {
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className="mb-4 relative" ref={dropdownRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}

      {/* Input display */}
      <div
        className="border border-gray-300 rounded-md px-3 py-2 cursor-pointer bg-white flex flex-wrap gap-2 min-h-[42px]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {value.length > 0 ? (
          value.map((val) => {
            const item = data.find((d) => d[valueField] === val);
            return (
              <span
                key={val}
                className="bg-primary text-white px-2 py-1 rounded-md text-xs flex items-center gap-1"
              >
                {item ? item[labelField] : val}
                <button
                  type="button"
                  className="text-white hover:text-gray-200 font-bold"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleSelect(val);
                  }}
                >
                  ×
                </button>
              </span>
            );
          })
        ) : (
          <span className="text-gray-400 text-sm">{placeholder}</span>
        )}
      </div>

      {/* Dropdown list */}
      {isOpen && (
        <div className="absolute z-10 bg-white border border-gray-300 rounded-md mt-1 w-full max-h-48 overflow-y-auto shadow-lg">
          {data.map((item) => {
            const val = item[valueField];
            const isSelected = value.includes(val);
            return (
              <div
                key={val}
                onClick={() => toggleSelect(val)}
                className={`px-3 py-2 cursor-pointer text-sm ${
                  isSelected
                    ? "bg-primary text-white"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {item[labelField]}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ModernMultiSelect;
