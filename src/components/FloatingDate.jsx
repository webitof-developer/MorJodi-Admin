import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt } from "react-icons/fa";

const FloatingDate = ({
    label,
    value,
    onChange,
    required = false,
    className = "",
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasValue = value !== null && value !== undefined;

    return (
        <div className={`relative ${className}`}>
            <div className={`
        block w-full text-sm text-gray-900 bg-transparent rounded-xl border border-gray-300 focus-within:border-[#A52A2A]
      `}>
                <DatePicker
                    selected={value}
                    onChange={onChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    dateFormat="dd MMM, yyyy"
                    className="w-full bg-transparent p-3 pt-4 pb-2.5 focus:outline-none rounded-xl"
                    required={required}
                    {...props}
                />
            </div>

            <label
                className={`
          absolute duration-300 transform origin-[0] bg-white px-1 left-3 pointer-events-none z-10
          ${hasValue || isFocused
                        ? "text-xs -translate-y-3 scale-90 top-1.5 text-[#A52A2A]"
                        : "text-sm -translate-y-1/2 scale-100 top-1/2 text-gray-500"
                    }
        `}
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>

            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                <FaCalendarAlt className="w-3 h-3 text-gray-400" />
            </div>
        </div>
    );
};

export default FloatingDate;
