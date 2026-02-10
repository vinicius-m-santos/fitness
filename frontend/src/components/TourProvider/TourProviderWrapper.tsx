import { useOnboardingStore } from "@/stores/onboardingStore";
import { TourProvider } from "@reactour/tour";

export function TourProviderWrapper({ children }: { children: React.ReactNode }) {
    const { tourConfig } = useOnboardingStore();
    console.log(tourConfig);

    return (
        <TourProvider
            steps={[]}
            showBadge={tourConfig.showBadge}
            showCloseButton={tourConfig.showCloseButton}
            showNavigation={tourConfig.showNavigation}
            className="rounded-sm"
            disableInteraction={tourConfig.disableInteraction}
            disableDotsNavigation={tourConfig.disableDotsNavigation}
        >
            {children}
        </TourProvider>
    );
}