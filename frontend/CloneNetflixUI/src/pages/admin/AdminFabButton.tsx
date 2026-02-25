// src/components/AdminFabButton.tsx
import { useNavigate } from "react-router-dom";

const AdminFabButton = () => {
    const navigate = useNavigate();

    const getUserRole = () => {
        const token = localStorage.getItem("token");
        if (!token) return null;

        try {
            // Розділяємо токен на частини
            const parts = token.split(".");
            if (parts.length !== 3) return null;

            const payloadBase64 = parts[1];
            const payloadJson = atob(payloadBase64);
            const payload = JSON.parse(payloadJson);

            // Беремо роль з можливих місць + робимо lowercase
            const roleRaw = payload.role || payload.user?.role || null;
            return roleRaw ? roleRaw.toLowerCase() : null;
        } catch (err) {
            console.warn("Не вдалося розпарсити JWT для ролі:", err);
            return null;
        }
    };

    const role = getUserRole();

    if (role !== "admin") {
        return null;
    }

    return (
        <button
            type="button"   // ← це найважливіший рядок
            onClick={(e) => {
                e.preventDefault();     // блокує submit форми
                e.stopPropagation();    // блокує спливання події
                navigate("/admin");
            }}
            className="
    fixed top-6 left-6 z-[100]
    w-14 h-14 rounded-full
    bg-gradient-to-br from-indigo-600 to-purple-600
    text-white shadow-2xl hover:shadow-indigo-500/50
    flex items-center justify-center
    transition-all duration-300 hover:scale-110 active:scale-95
    border-2 border-white/20
  "
            title="Панель адміністратора"
            aria-label="Відкрити панель адміністратора"
        >
            <svg
                className="w-7 h-7"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
            </svg>
        </button>
    );
};

export default AdminFabButton;