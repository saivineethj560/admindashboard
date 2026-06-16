import React from "react";

const Creation = () => {
  return (
    <div className="py-3 px-3">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow border-2 border-blue-500 overflow-hidden">
          <div className="p-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <img src="./quote4.png" alt="Logo" className="mr-4 w-40 h-12 rounded-lg" />
              </div>
              <div className="flex-grow flex justify-center">
                <div className="bg-[#83bcc9] px-5 py-1.5 rounded-lg inline-block -ml-20">
                  <h1 className="text-xl font-bold text-white"></h1>
                </div>
              </div>
              <div>
                <button className="text-white bg-gradient-to-br from-[#4183a5] via-[#56b2c4] to-[#139aed] hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] rounded-full p-1">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div className="h-0.5 bg-blue-600 w-[95%] mx-auto"></div>

          <div className="p-3">
            <div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="flex justify-center">
                  <img
                    src="./stationeryimg.jpg"
                    alt="Form process illustration"
                    className="max-w-full max-h-48 mb-3 mt-4"
                  />
                </div>

                <div className="space-y-2">
                  {/* Date field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-sm">
                        Date<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="date"
                        name="date"
                        className="w-full border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50"
                      />
                    </div>
                  </div>

                  {/* Employee Name field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Employee Name<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        className="w-full border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50"
                      />
                    </div>
                  </div>

                  {/* Email Id field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Email Id<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        className="w-full border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50"
                      />
                    </div>
                  </div>

                  {/* Request For - Radio Buttons */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Request For<span className="text-red-500 ml-1">*</span>
                      </label>
                      <div className="flex gap-2">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="request_for"
                            value="Self"
                            className="mr-1 h-3 w-3 text-blue-600"
                          />
                          <span className="text-sm">Self</span>
                        </label>
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="radio"
                            name="request_for"
                            value="Others"
                            className="mr-1 h-3 w-3 ml-8 text-blue-600"
                          />
                          <span className="text-sm">Others</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Employee ID field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Employee ID<span className="text-red-500 ml-1">*</span>
                      </label>
                      <input
                        type="text"
                        name="emp_id"
                        className="w-full border border-blue-500 rounded-full p-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 bg-blue-50"
                      />
                    </div>
                  </div>

                  {/* Department field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Department<span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        name="department"
                        className="w-full border border-blue-500 rounded-full p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="">Select</option>
                        <option value="ACCOUNTS">ACCOUNTS</option>
                        <option value="CS">CS</option>
                        <option value="PURCHASE">PURCHASE</option>
                        <option value="IT">IT</option>
                      </select>
                    </div>
                  </div>

                  {/* Department HOD field */}
                  <div>
                    <div className="flex items-center">
                      <label className="w-1/3 text-indigo-800 font-bold text-xs">
                        Department HOD<span className="text-red-500 ml-1">*</span>
                      </label>
                      <select
                        name="hod_name"
                        className="w-full border border-blue-500 rounded-full p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="">Select</option>
                        <option value="Durgapraveen.A">Durga Praveen</option>
                        <option value="Manisha.N">Manisha</option>
                        <option value="Siddardha.N">Siddartha</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stationery Items Section */}
              <div className="mt-3 mx-6">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-indigo-800 font-bold text-base">
                    Stationery Items<span className="text-red-500 ml-1">*</span>
                  </label>
                  <button
                    type="button"
                    className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white w-7 h-7 rounded-lg flex items-center justify-center text-base"
                  >
                    +
                  </button>
                </div>

                <div className="bg-blue-600 text-white grid grid-cols-2 p-1.5 rounded-t-lg text-sm font-medium">
                  <div className="font-bold pr-5 border-r-2 border-white">Stationery Item</div>
                  <div className="font-bold px-2">Quantity</div>
                </div>

                <div className="max-h-36 overflow-y-auto border rounded-b-md">
                  <div className="grid grid-cols-2 border-b border-gray-300 p-1">
                    <div className="pr-2 border-r-2 border-gray-300">
                      <select
                        name="stationary"
                        className="w-full border border-blue-500 rounded-full p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      >
                        <option value="">Select</option>
                        <option value="Notebook">Notebook</option>
                        <option value="Pen">Pen</option>
                        <option value="Folder">Folder</option>
                        <option value="Marker">Marker</option>
                      </select>
                    </div>

                    <div className="flex items-center px-2">
                      <select
                        name="quantity"
                        className="w-full border border-blue-500 rounded-full p-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400 flex-grow"
                      >
                        <option value="">Qty</option>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-center gap-4 mt-4">
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white px-5 py-1.5 rounded-md flex items-center gap-1.5 text-sm"
                >
                  Save as Draft
                </button>
                <button
                  type="button"
                  className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] flex items-center gap-1.5 text-white px-5 py-1.5 rounded-md text-sm"
                >
                  Submit
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Creation;