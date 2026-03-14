import { Bell } from "lucide-react";

const NotificationBell = ({ count }: any) => {

  return (
    <div className="relative">

      <Bell className="w-6 h-6 text-gray-700" />

      {count > 0 && (
        <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1 rounded-full">
          {count}
        </span>
      )}

    </div>
  );
};

export default NotificationBell;