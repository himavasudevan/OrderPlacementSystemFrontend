import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ManageCustomers from "@/pages/ManageCustomers";
import { Toaster } from "@/components/ui/sonner";
import ManageOrders from "./pages/ManageOrders";

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow px-4 py-3 flex justify-between items-center">
          <h1 className="text-xl font-bold text-blue-600">Order Placement System</h1>
          <nav className="flex gap-4">
            <Link to="/" className="hover:text-blue-600">Orders</Link>
            <Link to="/customers" className="hover:text-blue-600">Customers</Link>
          </nav>
        </header>

        {/* Main content */}
        <main className="flex-1 p-4">
          <Routes>
            <Route path="/" element={< ManageOrders/>} />
            <Route path="/customers" element={<ManageCustomers />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer className="text-center text-sm text-gray-500 py-4 border-t">
          © {new Date().getFullYear()}  Order Placement System
        </footer>

        {/* Global toaster for notifications */}
        <Toaster position="top-right" richColors />
      </div>
    </Router>
  );
}


