import React from "react";

const ConfirmationEmailSent: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Лист для підтвердження надіслано
        </h2>
        <p className="text-center text-gray-700">
          Будь ласка, перевірте свою пошту, щоб підтвердити обліковий запис.
        </p>
      </div>
    </div>
  );
};

export default ConfirmationEmailSent;
