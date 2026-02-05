import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import StockManagement from "./pages/StockManagement";
import OrderManagement from "./pages/OrderManagement";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import NotFound from "./pages/NotFound";
import InvoiceManagment from "./pages/InvoiceManagement";
import PaymentRecording from "./pages/PaymentRecording";
import DeliveryNotes from "./pages/DeliveryNotes";

const queryClient = new QueryClient();

// Simple auth check
const isAuthenticated = () => !!localStorage.getItem("token");

// Wrapper for protected routes
const PrivateRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route
            path="/"
            element={
              <PrivateRoute>
                <MainLayout>
                  <Dashboard />
                </MainLayout>
              </PrivateRoute>
            }
          />
          <Route path="/stocks" element={
            <MainLayout>
              <StockManagement />
            </MainLayout>
          } />
          <Route path="/orders" element={
            <MainLayout>
              <OrderManagement />
            </MainLayout>
          } />
          <Route path="/invoices" element={
            <MainLayout>
              <InvoiceManagment />
            </MainLayout>
          } />
          <Route path="/payments" element={
            <MainLayout>
              <PaymentRecording />
            </MainLayout>
          } />
          <Route path="/receipts" element={
            <MainLayout>
              <div className="flex items-center justify-center h-64">
                <p className="text-muted-foreground">Receipt Management - Coming Soon</p>
              </div>
            </MainLayout>
          } />
          <Route path="/delivery-notes" element={
            <MainLayout>
              <DeliveryNotes />
            </MainLayout>
          } />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;