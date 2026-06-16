// src/components/CurrentDateField.js
import React from "react";

const CurrentDateField = ({ name = "date", label = "Date" }) => {
  const getCurrentDate = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const yyyy = today.getFullYear();
    return `${dd}-${mm}-${yyyy}`;
  };
  const currentDate = getCurrentDate();
  return (
    <div className="w-full">
      <label className="block mb-1 font-medium text-sm text-blue-800">{label}</label>
      <input
        type="text"
        name={name}
        value={currentDate}
        readOnly
        className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-md form-input focus:outline-none"
      />
    </div>
  );
};

export default CurrentDateField;
