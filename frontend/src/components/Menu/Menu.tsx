import { useAuth } from "@/providers/AuthProvider";
import PersonalMenu from "./PersonalMenu";
import ClientMenu from "./ClientMenu";

const Menu = () => {
    const { user } = useAuth();

    if (user?.roles.includes("ROLE_CLIENT")) {
        return <ClientMenu />;
    }

    if (user?.roles.includes("ROLE_PERSONAL")) {
        return <PersonalMenu />;
    }

    return null;
};

export default Menu;
