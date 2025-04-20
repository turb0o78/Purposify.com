
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Content from "./pages/Content";
import Workflows from "./pages/Workflows";
import NewWorkflow from "./pages/NewWorkflow";
import Connections from "./pages/Connections";
import NotFound from "./pages/NotFound";
import Navbar from "./components/Navbar";

const queryClient = new QueryClient();

const App = () => {
  const renderWithNavbar = (Component: React.ComponentType) => (
    <>
      <Navbar />
      <Component />
    </>
  );

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={renderWithNavbar(Dashboard)} />
            <Route path="/content" element={renderWithNavbar(Content)} />
            <Route path="/workflows" element={renderWithNavbar(Workflows)} />
            <Route path="/workflows/new" element={renderWithNavbar(NewWorkflow)} />
            <Route path="/connections" element={renderWithNavbar(Connections)} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
