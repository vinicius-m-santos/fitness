import { useState } from "react";
import { UserCircleIcon } from "@heroicons/react/24/outline";
import { Link } from "react-router-dom";

export default function UserDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      {/* Button */}
      <button
        onClick={() => setOpen(!open)}
        className={`cursor-pointer inline-flex justify-between items-center p-2 text-white text-sm font-medium rounded-full focus:outline-none ${
          open ? "bg-blue-400" : ""
        }`}
      >
        <UserCircleIcon className="w-5 h-5 text-black hover:text-gray-700" />
      </button>

      {/* Menu */}
      {open && (
        <div className="absolute z-2 right-0 mt-2 w-40 bg-white border border-gray-200 divide-y divide-gray-100 rounded-lg shadow-lg">
          <ul className="py-1 text-sm text-gray-700">
            {/* <Link to="/profile">
              <button className="default w-full text-left px-4 py-2 hover:bg-gray-100">
                Profile
              </button>
            </Link>
            <li>
              <button className="default w-full text-left px-4 py-2 hover:bg-gray-100">
                Settings
              </button>
            </li> */}
            <li>
              <Link
                to="/logout"
                className="w-full inline-block text-left px-4 py-2 hover:bg-gray-100"
              >
                Logout
              </Link>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}