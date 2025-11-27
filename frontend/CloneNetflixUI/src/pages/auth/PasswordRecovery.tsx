import React, { useState } from "react";

const PasswordRecovery: React.FC = () => {
  const [email, setEmail] = useState<string>("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you can add logic to send the email for password recovery
    console.log("Email submitted:", email);
  };

  return (
    <div className="flex items-center justify-center min-h-screen color-black bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md color-black w-full">
        <h2 className="text-2xl font-bold mb-6 color-black text-black text-center">
          Відновлення паролю
        </h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4 color-black">
            <label htmlFor="email" className="block text-gray-700 mb-2">
              Введіть пошту для відновлення паролю
            </label>
            <input
              type="email"
              placeholder="example@gmail.com"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 text-black py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
          >
            Відправити
          </button>
        </form>
      </div>
    </div>
  );
};

export default PasswordRecovery;
