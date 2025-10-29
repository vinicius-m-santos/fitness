import { useMediaQuery } from "react-responsive";
import ClientTable from "./ClientTable";
import ClientCards from "./ClientCards";

export const ClientList = ({ clientTableData, loading }) => {
    const isMobile = useMediaQuery({ maxWidth: 768 });

    return isMobile ? (
        <ClientCards clientTableData={clientTableData} loading={loading} />
    ) : (
        <ClientTable clientTableData={clientTableData} loading={loading} />
    );
};
