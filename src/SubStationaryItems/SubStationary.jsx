
const SubStationary = () => {
  return (
    <>
      <button
        type="button"
        onClick={handleAddItem}
        className="bg-blue-600 hover:bg-gradient-to-r hover:from-[#c71d6f] hover:to-[#d09693] text-white w-6 h-6 rounded flex items-center justify-center text-sm"
      >
        +
      </button>

      {/* Header */}
      <div className="bg-blue-600 text-white grid grid-cols-2 p-1 rounded-t-md text-[10px] font-semibold">
        <div className="pr-2 border-r border-white">Stationery Item</div>
        <div className="px-2">Quantity</div>
      </div>

      {/* Items */}
      <div className="max-h-60 overflow-y-auto">
        {(formData.request_for === "Standard" || formData.request_for === "Projects") ? (
          <div className="max-h-98 overflow-y-auto border rounded-b-md">
            {stationeryOptions[formData.request_for].map((itemName, index) => (
              <div
                key={index}
                className="grid grid-cols-2 items-center border-b border-gray-300 py-[-5px] px-5 text-[13px]"
              >
                <div className="text-gray-700">{itemName}</div>
                <div>
                  <select
                    name={`quantity-${index}`}
                    value=
                    {
                      formData.items.find(i => i.stationary === itemName)?.quantity || ""
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      let updatedItems = [...formData.items];
                      const existingIndex = updatedItems.findIndex(
                        i => i.stationary === itemName
                      );
                      if (existingIndex >= 0) {
                        updatedItems[existingIndex] =
                        {
                          ...updatedItems[existingIndex],
                          quantity: value,
                        };
                      }
                      else {
                        updatedItems.push({
                          stationary: itemName,
                          quantity: value,
                          remarks: "",
                        });
                      }
                      setFormData(prev => ({ ...prev, items: updatedItems }));
                    }}
                    className={`${inputStyle} w-full h-[27px] text-[8px] px-1`}>
                    <option value="">Select</option>
                    <option value="0">0</option>
                    <option value="1">1</option>
                  </select>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="max-h-36 overflow-y-auto border rounded-b-md">
            {formData.items.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-2 items-center border-b border-gray-300 py-[2px] px-2 text-[10px]">
                <div className="pr-2 border-r border-gray-300">
                  <select
                    name="stationary"
                    value={item.stationary}
                    onChange={(e) => handleItemChange(e, index)}
                    className={`${errors.items && attempted ? errorInputStyle : inputStyle} h-[28px] text-[8px] px-1 w-full`}
                  >
                    <option value="">Select item</option>
                    {stationeryItems.map((itemName, i) => (
                      <option key={i} value={itemName}>
                        {itemName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pl-2">
                  <input
                    type="number"
                    name="quantity"
                    placeholder="Qty"
                    min={1}
                    max={10}
                    value={item.quantity || ''}
                    onChange={(e) => handleItemChange(e, index)}
                    className={`${inputStyle} h-[26px] text-[10px] px-1 w-full`}
                  />
                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="text-red-600 ml-1"
                    >
                      <HiTrash className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

export default SubStationary;