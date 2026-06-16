import React, { useState } from 'react';
import { X, FileText, Download } from 'lucide-react';

const TwoVehicleDetailsModal = ({ isOpen, onClose, vehicleData }) => {
  if (!isOpen || !vehicleData) return null;

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString;
    }
  };

  const handleFileDownload = (fileName) => {
    if (fileName) {
      // Add your file download logic here
      console.log('Downloading file:', fileName);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold">Vehicle Details</h2>
            <p className="text-blue-100">Vehicle No: {vehicleData?.VH_NUMBER || 'N/A'}</p>
          </div>
          <button
            onClick={onClose}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-100px)]">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    SNO
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    DATE OF<br />REGISTRATION
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    VALID OF<br />REGISTRATION
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    USER /<br />DEPT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    DRIVER<br />NAME
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    DRIVER<br />MOBILE NO
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    INSURANCE<br />START DATE
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    INSURANCE<br />END DATE
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    INSURANCE<br />COMPANY
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    INSURANCE<br />COPY
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    INSURANCE<br />AMOUNT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    TRAFFIC<br />CHALLAN
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    CHALLAN<br />FILE
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    CHALLAN<br />DATE
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    CHALLAN<br />AMT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    RC<br />UPLOAD
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    FAST TAG<br />NO
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    FAST TAG<br />BANK
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    FAST TAG<br />MOBILE NO
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    FAST TAG<br />DATE
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    FAST TAG<br />UPLOAD
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    FAST<br />AMT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    STATUS<br />DATE
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    STATUS<br />AMOUNT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    CLAIMED<br />AMT
                  </th>
                  <th className="border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 text-center">
                    STATUS<br />REASON
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">1</td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {formatDate(vehicleData?.REG_DT)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {formatDate(vehicleData?.REG_VALID)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.VH_USER || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.VH_DRIVER || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.MOBILE || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {formatDate(vehicleData?.INSURANCE_START_DATE)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {formatDate(vehicleData?.INSURANCE_END_DATE)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.INSURANCE_COMPANY || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.INSURANCE_COPY ? (
                      <button
                        onClick={() => handleFileDownload(vehicleData?.INSURANCE_COPY)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <FileText size={12} />
                        View
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.INSURANCE_AMOUNT || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.TRAFFIC_CHALLAN || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.CHALLAN_FILE ? (
                      <button
                        onClick={() => handleFileDownload(vehicleData?.CHALLAN_FILE)}
                        className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <FileText size={12} />
                        View
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {formatDate(vehicleData?.CHALLAN_DATE)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.CHALLAN_AMT || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.RC_UPLOAD ? (
                      <button
                        onClick={() => handleFileDownload(vehicleData?.RC_UPLOAD)}
                        className="bg-purple-500 hover:bg-purple-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <FileText size={12} />
                        View
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.FAST_TAG_NO || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.FAST_TAG_BANK || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.FAST_TAG_MOBILE || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {formatDate(vehicleData?.FAST_TAG_DATE)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.FAST_TAG_UPLOAD ? (
                      <button
                        onClick={() => handleFileDownload(vehicleData?.FAST_TAG_UPLOAD)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-2 py-1 rounded text-xs flex items-center gap-1"
                      >
                        <FileText size={12} />
                        View
                      </button>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.FAST_AMT || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {formatDate(vehicleData?.STATUS_DATE)}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.STATUS_AMOUNT || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.CLAIMED_AMT || '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-2 text-sm text-center">
                    {vehicleData?.STATUS_REASON || '-'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Demo component to show how to use the modal
const App = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Sample vehicle data for demonstration
  const sampleVehicleData = {
    VH_NUMBER: "TS09EA1234",
    REG_DT: "2020-01-15",
    REG_VALID: "2025-01-15",
    VH_USER: "John Doe",
    VH_DRIVER: "Driver Name",
    MOBILE: "9876543210",
    INSURANCE_START_DATE: "2024-01-01",
    INSURANCE_END_DATE: "2024-12-31",
    INSURANCE_COMPANY: "LIC Insurance",
    INSURANCE_COPY: "insurance_copy.pdf",
    INSURANCE_AMOUNT: "50000",
    TRAFFIC_CHALLAN: "Yes",
    CHALLAN_FILE: "challan_file.pdf",
    CHALLAN_DATE: "2024-03-15",
    CHALLAN_AMT: "5000",
    RC_UPLOAD: "rc_copy.pdf",
    FAST_TAG_NO: "FT123456789",
    FAST_TAG_BANK: "SBI Bank",
    FAST_TAG_MOBILE: "9876543210",
    FAST_TAG_DATE: "2024-02-01",
    FAST_TAG_UPLOAD: "fasttag_copy.pdf",
    FAST_AMT: "2000",
    STATUS_DATE: "2024-06-01",
    STATUS_AMOUNT: "15000",
    CLAIMED_AMT: "10000",
    STATUS_REASON: "Maintenance completed"
  };

  const handleOpenModal = () => {
    setSelectedVehicle(sampleVehicleData);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedVehicle(null);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Vehicle Management System</h1>
      
      <button
        onClick={handleOpenModal}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
      >
        Open Vehicle Details
      </button>

      <TwoVehicleDetailsModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        vehicleData={selectedVehicle}
      />
    </div>
  );
};

export default App;