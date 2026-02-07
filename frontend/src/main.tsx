import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App";
import "./index.css";
import "./i18n";
import { AuthProvider } from "./providers/AuthProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FeedbackButton from "./components/Feedback/FeedbackButton";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import * as Sentry from "@sentry/react";

ModuleRegistry.registerModules([AllCommunityModule]);

const queryClient = new QueryClient();

const isProd =
    (import.meta as unknown as { env?: { VITE_ENV?: string } }).env
        ?.VITE_ENV === "production";

Sentry.init({
    dsn: "https://5d922fe9f235a78a033a1a756c9914ab@o4510824276099072.ingest.us.sentry.io/4510824278720512",
    sendDefaultPii: true,
    enabled: isProd,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <BrowserRouter>
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <Toaster position="top-center" />
                    <App />
                    <FeedbackButton />
                </AuthProvider>
            </QueryClientProvider>
        </BrowserRouter>
    </React.StrictMode>
);
