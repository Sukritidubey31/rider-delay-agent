import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import OrderTrackingPage from "./pages/OrderTracking";
import OrderList from "./pages/OrderList";
import OrderDetail from "./pages/OrderDetail";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                    element={<Dashboard />} />
        <Route path="/order"               element={<OrderList />} />
        <Route path="/order/:orderId"      element={<OrderTrackingPage />} />
        <Route path="/orders/:orderId"     element={<OrderDetail />} />
      </Routes>
    </BrowserRouter>
  );
}