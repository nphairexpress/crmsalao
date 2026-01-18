import { AppHeaderNew } from "./AppHeaderNew";
import { TopNavigation } from "./TopNavigation";

interface AppLayoutNewProps {
  children: React.ReactNode;
}

export function AppLayoutNew({ children }: AppLayoutNewProps) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeaderNew />
      <TopNavigation />
      <main className="p-4 md:p-6">
        {children}
      </main>
    </div>
  );
}
