import React, { createContext, useState, useContext } from "react";

const IndentContext = createContext();

export const IndentProvider = ({ children }) => {
  const [selectedIndent, setSelectedIndent] = useState(null);

  return (
    <IndentContext.Provider value={{ selectedIndent, setSelectedIndent }}>
      {children}
    </IndentContext.Provider>
  );
};

export const useIndent = () => useContext(IndentContext);
