
import { Outlet } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";

const Settings = () => {
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <DashboardHeader
        title="Paramètres"
        description="Gérez vos préférences et votre abonnement"
      />
      <div className="mt-6">
        <Outlet />
      </div>
    </div>
  );
};

export default Settings;
