import { Link } from "react-router-dom";
import UserDropdown from "@/components/Menu/components/UserDropdown";
import logo from "@/assets/fitrise_logo.png";
import { useState } from "react";
import {
    ChartNoAxesColumnIncreasing,
    House,
    LogIn,
    LogOut,
    MenuIcon,
    X,
} from "lucide-react";

const CleanNoAuthMenu = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <nav className="bg-gray-100 text-gray-800 shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <Link to="/">
                            <img
                                src={logo}
                                className="w-30 h-10 mt-2 object-contain"
                            />
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-2 items-center">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-black font-bold text-sm hover:text-gray-600 px-4 py-2 rounded transition"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <House size={16} />
                            Início
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 text-black font-bold text-sm hover:text-gray-600 px-4 py-2 rounded transition"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <LogIn size={16} />
                            Entrar
                        </Link>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden">
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="p-2 focus:outline-none"
                        >
                            {mobileMenuOpen ? (
                                <X size={24} />
                            ) : (
                                <MenuIcon size={24} />
                            )}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden pb-4 flex flex-col">
                        <Link
                            to="/"
                            className="flex items-center gap-2 text-black font-bold text-sm hover:text-gray-600 px-4 py-2 rounded transition"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <House size={16} className="mr-2" />
                            Início
                        </Link>
                        <Link
                            to="/login"
                            className="flex items-center gap-2 text-black font-bold text-sm hover:text-gray-600 px-4 py-2 rounded transition"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <LogIn size={16} className="mr-2" />
                            Entrar
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default CleanNoAuthMenu;
