import React, { useState } from "react";

// Custom Icon components to replace lucide-react
const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

const FactoryIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 20a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8l-7 5V8l-7 5V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z"></path>
    <path d="M17 22v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5"></path>
  </svg>
);

const UsersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const FileTextIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <line x1="10" y1="9" x2="8" y2="9"></line>
  </svg>
);

const UserCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <polyline points="16 11 18 13 22 9"></polyline>
  </svg>
);

const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"></path>
    <path d="M22 2 11 13"></path>
  </svg>
);

const Mrf = () => {
  // Form state
  const [formData, setFormData] = useState({
    plantCode: "",
    designation: "",
    totalRequirement: "",
    availability: "",
    actualRequirement: ""
  });

  // Validation state
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Sample data
  const plantCodes = ["1234", "5678", "9012", "3456"];
  const designations = ["Engineer", "Technician", "Operator", "Supervisor", "Manager"];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Validate field when changed
    validateField(name, value);
  };

  // Handle field blur for validation
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched({
      ...touched,
      [name]: true
    });
    validateField(name, formData[name]);
  };

  // Validate a single field
  const validateField = (name, value) => {
    let newErrors = { ...errors };

    if (!value || value.trim() === "") {
      newErrors[name] = "This field is required";
    } else {
      delete newErrors[name];
    }

    setErrors(newErrors);
  };

  // Validate all fields
  const validateForm = () => {
    let isValid = true;
    let newErrors = {};
    let newTouched = {};

    // Check each field
    Object.keys(formData).forEach(field => {
      newTouched[field] = true;
      if (!formData[field] || formData[field].trim() === "") {
        newErrors[field] = "This field is required";
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched(newTouched);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);

    if (validateForm()) {
      console.log("Form submitted successfully", formData);
      // Here you would typically send the data to an API
    } else {
      console.log("Form has errors");
    }
  };

  // Helper function to determine field status
  const getFieldStatus = (fieldName) => {
    if ((touched[fieldName] || isSubmitted) && errors[fieldName]) {
      return "error";
    }
    if ((touched[fieldName] || isSubmitted) && formData[fieldName] && !errors[fieldName]) {
      return "success";
    }
    return "normal";
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md border-2 border-blue-600">
      <div className="relative mb-6">
        {/* Logo on the far left, bigger size */}
        <img
          src="/mrflogo.png"
          alt="MRF Logo"
          className="absolute left-0 top-1/2 transform -translate-y-1/2 w-20 h-20"
        />

        {/* Centered heading */}
        <h2 className="text-2xl font-bold text-center text-blue-600">
          Manpower Upload Form
        </h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* First Row - Plant Code and Designation */}
        <div className="flex flex-col md:flex-row ">
          {/* Plant Code Dropdown */}
          <div className="flex-2">
            <label className="block text-sm font-semibold text-blue-600 mb-1 flex items-center">
              <span className="mr-1 text-gray-600"><FactoryIcon /></span>
              Plant Code
            </label>
            <div className="relative">
              <select
                name="plantCode"
                value={formData.plantCode}
                onChange={handleChange}
                onBlur={handleBlur}
                className={`w-full p-2 border rounded-xl appearance-none pr-8 ${getFieldStatus("plantCode") === "error"
                    ? "border-red-500 focus:ring-red-500"
                    : getFieldStatus("plantCode") === "success"
                      ? "border-green-500 "
                      : "border-blue-700 "
                  }`}
              >
                <option value="" disabled hidden>Select Plant Code</option>

                {plantCodes.map((code) => (
                  <option key={code} value={code}>{code}</option>
                ))}
              </select>
              {getFieldStatus("plantCode") === "success" && (
                <span className="absolute right-6 top-2.5 text-green-500">

                  <CheckIcon />
                </span>
              )}
              {getFieldStatus("plantCode") === "error" && (
                <span className="absolute right-6 top-2.5 text-red-500">
                  <XIcon />
                </span>
              )}
            </div>
            {getFieldStatus("plantCode") === "error" && (
              <p className="mt-1 text-sm text-red-500">{errors.plantCode}</p>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-center mt-6">
          <button
            type="submit"
            className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Mrf;