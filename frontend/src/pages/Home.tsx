import {
    Users,
    Activity,
    ClipboardCheck,
    BarChart2,
    Star,
    Clock,
    Heart,
    ChartNoAxesColumnIncreasing,
    Clipboard,
    LogOut,
    MenuIcon,
    X,
} from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../assets/fitrise_logo.png";
import { useState } from "react";

export default function Home() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen flex flex-col bg-white text-gray-800">
            {/* Navbar */}
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
                                to="/login"
                                className="flex items-center gap-2 text-black font-bold text-sm hover:text-gray-600 px-4 py-2 rounded transition"
                            >
                                Entrar
                            </Link>
                        </div>

                        {/* Mobile menu button */}
                        <div className="md:hidden">
                            <button
                                onClick={() =>
                                    setMobileMenuOpen(!mobileMenuOpen)
                                }
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
                                to="/login"
                                className="flex items-center gap-2 text-black font-bold text-sm hover:text-gray-600 px-4 py-2 rounded transition"
                            >
                                Entrar
                            </Link>
                        </div>
                    )}
                </div>
            </nav>

            {/* Hero / Header */}
            <header className="flex flex-col items-center justify-center text-center py-16 bg-gray-50 flex-shrink-0">
                <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
                    Transforme o jeito de treinar seus clientes
                </h1>
                <p className="text-lg md:text-xl text-gray-600 max-w-2xl">
                    Organize treinos, acompanhe o progresso, colete dados e veja
                    resultados reais de forma simples e rápida.
                </p>
            </header>

            {/* Features Section */}
            <section className="py-16 flex-grow">
                <div className="container mx-auto text-center">
                    <h2 className="text-3xl font-semibold mb-12">
                        Funcionalidades principais
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition">
                            <Users size={48} className="text-blue-500 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Gerenciar Clientes
                            </h3>
                            <p>
                                Adicione, edite e acompanhe todos os seus
                                clientes facilmente.
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition">
                            <ClipboardCheck
                                size={48}
                                className="text-yellow-400 mb-4"
                            />
                            <h3 className="text-xl font-semibold mb-2">
                                Criar Treinos
                            </h3>
                            <p>
                                Monte treinos personalizados para cada cliente e
                                acompanhe a execução.
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition">
                            <Activity
                                size={48}
                                className="text-green-500 mb-4"
                            />
                            <h3 className="text-xl font-semibold mb-2">
                                Coletar Dados
                            </h3>
                            <p>
                                Registre progresso, medidas e evolução dos
                                treinos.
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition">
                            <BarChart2
                                size={48}
                                className="text-purple-500 mb-4"
                            />
                            <h3 className="text-xl font-semibold mb-2">
                                Analisar Resultados
                            </h3>
                            <p>
                                Visualize gráficos e métricas para entender o
                                desempenho dos clientes.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Extra Info Section */}
            <section className="bg-gray-50 py-16">
                <div className="container mx-auto text-center max-w-5xl">
                    <h2 className="text-3xl font-semibold mb-10">
                        Por que escolher a{" "}
                        <span className="font-bold">FITRISE</span>?
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition">
                            <Star size={48} className="text-yellow-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Produtividade
                            </h3>
                            <p>
                                Gerencie múltiplos clientes sem perder tempo com
                                planilhas ou papéis.
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition">
                            <Clock size={48} className="text-blue-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Evolução Real
                            </h3>
                            <p>
                                Coleta e análise de dados para mostrar
                                resultados tangíveis aos seus alunos.
                            </p>
                        </div>
                        <div className="flex flex-col items-center p-6 border rounded-lg hover:shadow-lg transition">
                            <Heart size={48} className="text-pink-400 mb-4" />
                            <h3 className="text-xl font-semibold mb-2">
                                Engajamento
                            </h3>
                            <p>
                                Clientes motivados e mais engajados com
                                acompanhamento personalizado.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Call to Action */}
            <section className="flex flex-col items-center justify-center py-16 flex-shrink-0 bg-white">
                <h2 className="text-3xl font-semibold mb-4">
                    Comece agora mesmo
                </h2>
                <p className="mb-8 text-gray-600 text-center max-w-xl">
                    Crie sua conta, organize seus treinos e veja resultados
                    concretos com seus clientes de maneira simples.
                </p>
                <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition">
                    Em Breve
                </button>
            </section>
        </div>
    );
}
