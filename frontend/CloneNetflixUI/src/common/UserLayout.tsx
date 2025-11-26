import { Link, Outlet } from "react-router";
// import {useNavigate} from "react-router-dom";

const UserLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 dark:bg-gray-900 dark:text-white">
      <header className="w-full py-4 px-6 bg-orange-500 text-white shadow-md flex justify-between">
        <h1 className="text-xl font-semibold">
          <Link to="/">FoodDelivery</Link>
        </h1>

        <div className="flex items-center gap-4">
          {/* <CartDrawer /> */}

          <>
            <Link
              to="/login"
              className="bg-white text-orange-500 px-4 py-2 rounded hover:bg-orange-100 transition"
            >
              Вхід
            </Link>

            <Link
              to="/register"
              className="bg-white text-orange-500 px-4 py-2 rounded hover:bg-orange-100 transition"
            >
              Реєстрація
            </Link>
          </>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6">
        <Outlet />
      </main>

      <footer className="w-full py-3 px-6 bg-gray-100 text-sm text-center dark:bg-gray-800 dark:text-gray-300">
        © 2025 FoodDelivery. Усі права захищено.
      </footer>
    </div>
  );
};

export default UserLayout;
