import { useAuth } from "../../contexts/AuthContext";
import { FaTruck, FaSignOutAlt } from "react-icons/fa";
import NotificationBell from "./NotificationBell";
import { useEffect, useState } from "react";
import api from "../../services/api";


const CustomerHeader = ({ user }: any) => {
  const { logout } = useAuth();



  const [upcomingOrdersCount, setUpcomingOrdersCount] = useState(0);

  useEffect(() => {
    const fetchUpcomingOrdersCount = async () => {
      try {
        const response = await api.get("/customer/upcoming-orders-count");
        setUpcomingOrdersCount(response.data.count);
      } catch (error) {
        console.error("Error fetching upcoming orders count:", error);
      }
    };
    fetchUpcomingOrdersCount();
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200">
              <FaTruck size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
                Delivery<span className="text-green-600">Proof</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4 md:gap-8">
            <div className="hidden md:block">
              {/* TODO: Add notification bell */}
              {/*create an const to update  the count on notification bell should be updated based on the number of upcoming orders */}
              <NotificationBell count={upcomingOrdersCount} />
            </div>

            <div className="flex items-center gap-3 pl-4 border-l border-gray-100">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-gray-900 leading-none">
                  {user?.name || (user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : null) || user?.email?.split('@')[0] || "Valued Customer"}
                </p>
                <p className="text-[11px] text-gray-400 font-medium">{user?.user_type?.toUpperCase()}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold shadow-md border-2 border-white">
                {user?.name?.charAt(0) || user?.first_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || "?"}
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
