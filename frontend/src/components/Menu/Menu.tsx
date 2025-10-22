import { Link } from "react-router-dom";
import UserDropdown from "@/components/Menu/components/UserDropdown";
import logo from "@/assets/fitrise_logo.png";
import { useAuth } from "@/providers/AuthProvider";
import toast from "react-hot-toast";
import { useState } from "react";
import {
    ChartNoAxesColumnIncreasing,
    Clipboard,
    LogOut,
    MenuIcon,
    X,
} from "lucide-react";

const Menu = () => {
    const { user } = useAuth();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const handleAnamneseLinkCopy = () => {
        navigator.clipboard.writeText(
            `${import.meta.env.VITE_FRONTEND_URL}/anamnese?token=${user?.uuid}`
        );
        toast.success("Link copiado!");
    };

    return (
        <nav className="bg-gray-100 text-gray-800 shadow-lg">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center py-4">
                    {/* Logo */}
                    <div className="flex items-center space-x-2">
                        <img
                            src={logo}
                            className="w-30 h-10 mt-2 object-contain"
                        />
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex space-x-2 items-center">
                        <Link
                            to="/dashboard"
                            className="flex items-center px-4 py-2 text-sm font-bold hover:text-gray-600 rounded-lg transition duration-500"
                        >
                            <ChartNoAxesColumnIncreasing
                                size={16}
                                className="mr-2"
                            />
                            Dashboard
                        </Link>
                        <button
                            onClick={handleAnamneseLinkCopy}
                            className="flex items-center px-4 py-2 text-sm font-bold hover:text-gray-600 rounded-lg transition duration-500"
                        >
                            <Clipboard size={16} className="mr-2" />
                            Copiar link anamnese
                        </button>
                        <UserDropdown />
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
                            to="/dashboard"
                            className="flex items-center px-4 py-2 mb-1 rounded-lg hover:bg-gray-200 transition"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <ChartNoAxesColumnIncreasing
                                size={16}
                                className="mr-2"
                            />
                            Dashboard
                        </Link>
                        <button
                            onClick={handleAnamneseLinkCopy}
                            className="flex items-center px-4 py-2 mb-1 rounded-lg hover:bg-gray-200 transition"
                        >
                            <Clipboard size={16} className="mr-2" />
                            Copiar link anamnese
                        </button>
                        <Link
                            to="/logout"
                            className="flex items-center px-4 py-2 mb-1 rounded-lg hover:bg-gray-200 transition"
                        >
                            <LogOut size={16} className="mr-2" />
                            Logout
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Menu;
