import React from "react";

const Button = ({ children, onClick, variant }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded ${
        variant === "default" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
      }`}
    >
      {children}
    </button>
  );
};

export default Button;
