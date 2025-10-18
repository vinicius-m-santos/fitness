import { Link } from "react-router-dom";
import UserDropdown from "./components/UserDropdown";
import logo from "../../assets/fitrise_logo.png";

const Menu = () => {
  return (
    <>
      <nav className="bg-gray-100 text-white shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-2">
              <img src={logo} className="w-30 h-10 mt-2 object-contain"/>
            </div>

            <div className="hidden md:flex space-x-1">
              <Link
                to="/dashboard"
                className="flex items-center px-4 py-2 text-sm font-bold text-black hover:text-gray-600 rounded-lg transition duration-500"
              >
                <i className="fas fa-boxes mr-2"></i>
                Dashboard
              </Link>
              <UserDropdown />
            </div>

            <div className="md:hidden">
              <button
                id="mobile-menu-button"
                className="p-2 focus:outline-none"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          </div>

          <div id="mobile-menu" className="hidden md:hidden pb-4">
            <a
              href="dashboard.html"
              className="block px-4 py-2 rounded-lg bg-gray-700 mb-1"
            >
              <i className="fas fa-tachometer-alt mr-2"></i>
              Dashboard
            </a>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Menu;