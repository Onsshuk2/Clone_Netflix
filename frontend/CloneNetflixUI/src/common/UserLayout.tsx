// src/layouts/UserLayout.tsx
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import { LogOut, User, ShoppingBag } from "lucide-react";

export default function UserLayout() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const token = localStorage.getItem("token");
  const isAuthenticated = !!token;

  let user = null;

  if (isAuthenticated) {
    const userJson = localStorage.getItem("user"); // або яка в тебе ключ, наприклад "userData"

    if (userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        user = {
          name: parsedUser.name || "Користувач",
          avatar:
            parsedUser.avatar ||
            "https://i.pinimg.com/736x/24/49/08/2449080f7429c683bc9cba619c237d01.jpg", // може бути null або URL
          email: parsedUser.email || "",
        };
      } catch (e) {
        console.error("Не вдалося розпарсити user з localStorage", e);
      }
    }
  }

  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const handleLogout = () => {
    localStorage.clear();
    setIsOpen(false);
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-orange-600 text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/dashboard" className="text-2xl font-black cursor-pointer">
            FoodDelivery
          </Link>

          <div className="flex items-center gap-6">
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-3 hover:bg-orange-700 px-4 py-2 rounded-xl transition"
              >
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt=""
                    className="w-10 h-10 rounded-full ring-4 ring-white/30"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-white text-orange-600 flex items-center justify-center font-bold text-xl ring-4 ring-white/30">
                    {user?.name[0]}
                  </div>
                )}
                <span className="hidden md:block font-medium">
                  {user?.name}
                </span>
              </button>

              {isOpen && (
                <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
                  <div className="p-5 bg-gradient-to-r from-orange-500 to-red-500 text-white">
                    <p className="font-bold text-lg">{user?.name}</p>
                    <p className="text-sm opacity-90">Преміум користувач</p>
                  </div>
                  <div className="py-3">
                    <Link
                      to="/profile"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center cursor-pointer gap-3 px-5 py-3 hover:bg-gray-50 text-gray-800"
                    >
                      <User className="w-5 h-5" /> Профіль
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 cursor-pointer px-5 py-3 hover:bg-gray-50 text-gray-800"
                    >
                      <ShoppingBag className="w-5 h-5" /> Замовлення
                    </Link>
                    <div className="h-px bg-gray-200 my-2 mx-5" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center cursor-pointer gap-3 px-5 py-3 hover:bg-red-50 text-red-600 font-medium"
                    >
                      <LogOut className="w-5 h-5 " /> Вийти
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-8">
        <Outlet />
      </main>

      <footer className="bg-white border-t py-8 text-center text-gray-600">
        © 2025 FoodDelivery. Всі права захищені.
      </footer>
    </div>
  );
}
