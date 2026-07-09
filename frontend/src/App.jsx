import { BrowserRouter, Routes, Route } from 'react-router-dom';
  import { AuthProvider } from './context/AuthContext';
  import ProtectedRoute from './components/common/ProtectedRoute';

  import Landing from './pages/Landing';
  import Login from './pages/Login';
  import Signup from './pages/Signup';
  import VerifyOtp from './pages/VerifyOtp';
  import ForgotPassword from './pages/ForgotPassword';
  import ResetPassword from './pages/ResetPassword';
  import BuyerDashboard from './pages/BuyerDashboard';
  import ShipperDashboard from './pages/ShipperDashboard';
  import DriverDashboard from './pages/DriverDashboard';
  import DriverLoads from './pages/DriverLoads';
  import DriverTrips from './pages/DriverTrips';
  import DriverWallet from './pages/DriverWallet';
  import AdminDashboard from './pages/AdminDashboard';
  import PostShipment from './pages/PostShipment';
  import ShipperShipments from './pages/ShipperShipments';
  import AdminShipments from './pages/AdminShipments';
  import AdminDrivers from './pages/AdminDrivers';
  import DriverDocuments from './pages/DriverDocuments';
  import About from './pages/About';
  import Pricing from './pages/Pricing';
  import Contact from './pages/Contact';
  import Faqs from './pages/Faqs';
  import Terms from './pages/Terms';
  import Privacy from './pages/Privacy';
  import AdminComplaints from './pages/AdminComplaints';
  import AdminReports from './pages/AdminReports';
  import ComplaintsPage from './pages/ComplaintsPage';
  import ShipperProfile from './pages/ShipperProfile';
  import ShipperProducts from './pages/ShipperProducts';
  import ShipperOrders from './pages/ShipperOrders';

  function App() {
    return (
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/faqs" element={<Faqs />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-otp" element={<VerifyOtp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />

            <Route
              path="/buyer/dashboard"
              element={
                <ProtectedRoute allowedRoles={['buyer']}>
                  <BuyerDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipper/dashboard"
              element={
                <ProtectedRoute allowedRoles={['shipper']}>
                  <ShipperDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipper/shipments"
              element={
                <ProtectedRoute allowedRoles={['shipper']}>
                  <ShipperShipments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipper/shipments/new"
              element={
                <ProtectedRoute allowedRoles={['shipper']}>
                  <PostShipment />
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute allowedRoles={['shipper']}>
                  <ShipperProfile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipper/products"
              element={
                <ProtectedRoute allowedRoles={['shipper']}>
                  <ShipperProducts />
                </ProtectedRoute>
              }
            />
            <Route
              path="/shipper/orders"
              element={
                <ProtectedRoute allowedRoles={['shipper']}>
                  <ShipperOrders />
                </ProtectedRoute>
              }
            />
            <Route
              path="/complaints"
              element={
                <ProtectedRoute allowedRoles={['buyer', 'shipper']}>
                  <ComplaintsPage />
    </ProtectedRoute>
  }
/>
            
            <Route
              path="/driver/dashboard"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/loads"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverLoads />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/trips"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverTrips />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/wallet"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverWallet />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/shipments"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminShipments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/complaints"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminComplaints />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/reports"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminReports />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/drivers"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDrivers />
                </ProtectedRoute>
              }
            />
            <Route
              path="/driver/documents"
              element={
                <ProtectedRoute allowedRoles={['driver']}>
                  <DriverDocuments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Example of a role-gated route, wired once dashboards exist:
            <Route
              path="/admin/*"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            /> */}

            <Route path="*" element={<div className="p-10">Page under construction</div>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    );
  }

  export default App;