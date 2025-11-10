import { Info } from "lucide-react";
import React, { useEffect } from "react";

interface NotificationProps {
  message: string;
  onclose: () => void;
  type?: string;
}

export default function Notification({
  message,
  onclose,
  type = "success",
}: NotificationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onclose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onclose]);

  const alertClasses = {
    success: "alert-success",
    error: "alert-error",
    warning: "alert-warning",
    info: "alert-info",
  };

  return (
    <div className="toast toast-top toast-center">
      <div
        className={`alert ${
          alertClasses[type as keyof typeof alertClasses] ||
          alertClasses.success
        } p-2 text-sm shadow-lg`}
      >
        <span className="flex items-center text-white font-semibold">
          <Info className="w-4 mr-2 font-bold " />
          {message}
        </span>
      </div>
    </div>
  );
}
