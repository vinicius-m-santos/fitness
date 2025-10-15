import { Routes, Route } from "react-router-dom";
import Anamnese from "./pages/Anamnese";

export default function App() {
    return (
        <Routes>
            <Route path="/" element={<Anamnese />} />
        </Routes>
    );
}
