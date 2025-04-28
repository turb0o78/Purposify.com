
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import Content from "./pages/Content";
import Workflows from "./pages/Workflows";
import NewWorkflow from "./pages/NewWorkflow";
import Connections from "./pages/Connections";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";
import EditWorkflow from "./pages/EditWorkflow";
import RepublishedContent from "./pages/RepublishedContent";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Subscription from "./pages/Subscription";
import Settings from "./pages/Settings";
import AccountSettings from "./pages/AccountSettings";

const queryClient = new QueryClient();

const App = () => {
  const renderWithNavbar = (Component: React.ComponentType) => (
    <ProtectedRoute>
      <Navbar />
      <Component />
    </ProtectedRoute>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/dashboard" element={renderWithNavbar(Dashboard)} />
              <Route path="/content" element={renderWithNavbar(Content)} />
              <Route path="/workflows" element={renderWithNavbar(Workflows)} />
              <Route path="/workflows/new" element={renderWithNavbar(NewWorkflow)} />
              <Route path="/workflows/edit/:id" element={renderWithNavbar(EditWorkflow)} />
              <Route path="/connections" element={renderWithNavbar(Connections)} />
              <Route path="/republished-content" element={renderWithNavbar(RepublishedContent)} />
              <Route path="/settings" element={renderWithNavbar(Settings)}>
                <Route path="subscription" element={<Subscription />} />
              </Route>
              <Route path="/settings/account" element={renderWithNavbar(AccountSettings)} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
