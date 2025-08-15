// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./contexts/AuthContext";
import LoginPage from "./pages/LoginPage";
import ManageCustomer from "./pages/ManageCustomers";
import ManageOrders from "./pages/ManageOrders";
import HomaPage from "./pages/HomaPage"; 


import ConsultantLayout from "./layouts/ConsultantLayout";
import ManageKonsulentPage from "./pages/ManageKonsulentPage";
import PasswordPage from "./pages/PasswordUpdatePage";

export default function App() {
  const { isAuthenticated,user } = useAuth();

  return (
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />


         {/* admin home */}
        <Route
          path="/admin"
          element={
            isAuthenticated && user?.role === "admin" ? (
             <ConsultantLayout>
              <HomaPage/>
             </ConsultantLayout>
              
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />


        {/* admin pages */}
        <Route
          path="/admin/customers"
          element={
           isAuthenticated && user?.role === "admin" ? (
              <ConsultantLayout>
              <ManageCustomer />
              </ConsultantLayout>
              ) : (
              <Navigate to="/login" replace />
            )
            
          }
        />


        <Route
          path="/admin/konsulent"
          element={
           isAuthenticated && user?.role === "admin" ? (
              <ConsultantLayout>
              <ManageKonsulentPage />
              </ConsultantLayout>
              ) : (
              <Navigate to="/login" replace />
            )
            
          }
        />


        {/* Consultant home */}
        <Route
          path="/konsulent"
          element={
            isAuthenticated && user?.role === "Konsulent" ? (
             <ConsultantLayout>
              <HomaPage/>
             </ConsultantLayout>
              
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Consultant pages */}
        <Route
          path="/konsulent/customers"
          element={
           isAuthenticated && user?.role === "Konsulent" ? (
              <ConsultantLayout>
              <ManageCustomer />
              </ConsultantLayout>
              ) : (
              <Navigate to="/login" replace />
            )
            
          }
        />

        <Route
          path="/konsulent/orders"
          element={
            isAuthenticated && user?.role === "Konsulent" ? (
              <ConsultantLayout>
              <ManageOrders />
              </ConsultantLayout>
            ) : (
              <Navigate to="/login" replace />
            )
            
          }
        />





        {/* Consultant pages */}
        <Route
          path="/konsulent/password"
          element={
           isAuthenticated && user?.role === "Konsulent" ? (
              <ConsultantLayout>
              <PasswordPage />
              </ConsultantLayout>
              ) : (
              <Navigate to="/login" replace />
            )
            
          }
        />

        {/* Default route – redirect based on role */}
        <Route
          path="/"
          element={
            isAuthenticated && user?.role ? (
              <Navigate to={`/${user.role.toLowerCase()}`} replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}
