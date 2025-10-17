import { Routes, Route } from "react-router-dom";
import Anamnese from "./pages/Anamnese";
import Login from "./pages/Login";
import Logout from "./pages/Logout";
import PrivateRoute from "./utils/Auth/PrivateRoute";
import Dashboard from "./pages/Dashboard";

export default function App() {
    return (
        <Routes>
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute>
                        <Dashboard />
                    </PrivateRoute>
                }
            />
            <Route path="/anamnese" element={<Anamnese />} />
            <Route path="/login" element={<Login />} />
            <Route path="/logout" element={<Logout />} />
        </Routes>
    );
}
