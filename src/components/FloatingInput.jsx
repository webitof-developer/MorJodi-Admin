import React, { useState } from "react";

const FloatingInput = ({
    label,
    value,
    onChange,
    type = "text",
    required = false,
    placeholder = "",
    className = "",
    multiline = false,
    rows = 3,
    ...props
}) => {
    const [isFocused, setIsFocused] = useState(false);

    const hasValue = value !== "" && value !== null && value !== undefined;

    const InputComponent = multiline ? 'textarea' : 'input';

    return (
        <div className={`relative ${className}`}>
            <InputComponent
                type={!multiline ? type : undefined}
                rows={multiline ? rows : undefined}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                required={required}
                placeholder={isFocused ? placeholder : " "}
                className={`
          block px-3 pb-2.5 pt-4 w-full text-sm text-gray-900 bg-transparent rounded-xl border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-[#A52A2A] peer
          ${multiline ? 'resize-none' : ''}
        `}
                {...props}
            />
            <label
                className={`
          absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-90 top-1.5 z-10 origin-[0] bg-white px-1 peer-focus:px-1 peer-focus:text-[#A52A2A] peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-1.5 peer-focus:scale-90 peer-focus:-translate-y-3 left-3 pointer-events-none
          ${multiline && !isFocused && !hasValue ? 'top-4' : ''}
        `}
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>
        </div >
    );
};

export default FloatingInput;
