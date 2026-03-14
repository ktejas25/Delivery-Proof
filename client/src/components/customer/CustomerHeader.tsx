import { useAuth } from "../../contexts/AuthContext";
import { FaTruck, FaSignOutAlt } from "react-icons/fa";
import NotificationBell from "./NotificationBell";

const CustomerHeader = ({ user }: any) => {
  const { logout } = useAuth();

  const initials = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <FaTruck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Swift<span className="text-indigo-600">Drop</span>
              </h1>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                Customer Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:block">
              <NotificationBell count={2} />
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">{user?.name}</p>
                <p className="text-[11px] text-gray-400 font-medium">Verified Customer</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white">
                {initials}
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold hover:bg-red-600 hover:text-white transition-all duration-300 group"
            >
              <span className="hidden sm:inline">Logout</span>
              <FaSignOutAlt className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default CustomerHeader;