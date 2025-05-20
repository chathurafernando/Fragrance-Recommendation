import logo from './logo.svg';
import './App.css';

import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
} from "react-router-dom";
import Register from './pages/Register';
import Login from './pages/Login';
// import Home from './pages/Home';
// import Write from './pages/Write';
import Navbar from './components/Navbar';
import "./style.scss";
import "./styles/login.scss"
import "./styles/register.scss"
import "./styles/BottomNav.scss"
import AdminDashboard from './pages/AdminDashboard';
import VendorDashboard from './pages/VendorDashboard';
import Notes from './pages/Notes';
import Fragrance from './pages/Fragrance';
import BrandManagement from './pages/BrandManagement';
import UserManagement from './pages/User';
import RegisterBusiness from './pages/RegisterBusiness';
import Products from './pages/Products';
import AddBusinessEntry from './pages/AddBusinessEntry';
import AddBusinessForm from './pages/AddBusinessForm';
import AddVendorForm from './pages/AddVendorForm';
import FavouriteNotes from './pages/FavouriteNotes';
import ProtectedRoute from './components/PrivateRoute';
import PersonalPreference from './pages/PersonalPreference';
import UserDashboard from './pages/UserDashboard';
import FragranceDetail from './pages/FragranceDetail';
import WishlistPage from './pages/WishlistPage';
import FragranceCompare from './pages/FragranceCompare'
import FragranceList from './pages/FragranceList';
import ProductGrid from './pages/ProductGrid';
import AddAdvertisementForm from './pages/AddAdvertisementForm ';
import OffersGrid from './components/OffersGrid'
import VendorBannerPayment from './pages/VendorBannerPayment';
import Offers from './pages/Offers'
import AdminOverviewReport from './pages/AdminOverviewReport';
import Footer from './components/Footer';

// Layout component with Navbar and Footer
const Layout = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh', // Ensures layout fills the whole viewport
    }}>
      <Navbar />
      <div style={{ flex: 1 }}> {/* Pushes footer down */}
        <Outlet />
      </div>
      <Footer /> {/* Will only appear at the bottom of the page */}
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { path: "/", element: <Register /> },

      {
        path: "/admin",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/manage-notes",
        element: (
          <ProtectedRoute requiredRole="admin">
            <Notes />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/manage-perfume",
        element: (
          <ProtectedRoute requiredRole="admin">
            <Fragrance />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/manage-brands",
        element: (
          <ProtectedRoute requiredRole="admin">
            <BrandManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/add-business",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AddBusinessEntry />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/add-business-form",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AddBusinessForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/add-vendor-form",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AddVendorForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/manage-users",
        element: (
          <ProtectedRoute requiredRole="admin">
            <UserManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "/admin/overview",
        element: (
          <ProtectedRoute requiredRole="admin">
            <AdminOverviewReport />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/your-favourite-notes",
        element: (
          <ProtectedRoute requiredRole="user">
            <FavouriteNotes />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/personal-preferences",
        element: (
          <ProtectedRoute requiredRole="user">
            <PersonalPreference />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/Dashboard",
        element: (
          <ProtectedRoute requiredRole="user">
            <UserDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/fragranceDetails/:id",
        element: (
          <ProtectedRoute requiredRole="user">
            <FragranceDetail />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/wishlist",
        element: (
          <ProtectedRoute requiredRole="user">
            <WishlistPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/compare",
        element: (
          <ProtectedRoute requiredRole="user">
            <FragranceCompare />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/filter",
        element: (
          <ProtectedRoute requiredRole="user">
            <FragranceList />
          </ProtectedRoute>
        ),
      },
      {
        path: "/user/offers",
        element: (
          <ProtectedRoute requiredRole="user">
            <Offers />
          </ProtectedRoute>
        ),
      },
      // Vendor Routes
      {
        path: "/vendor/register-business",
        element: (
          <ProtectedRoute requiredRole="vendor">
            <RegisterBusiness />
          </ProtectedRoute>
        ),
      },
      {
        path: "/vendor/add-products",
        element: (
          <ProtectedRoute requiredRole="vendor">
            <Products />
          </ProtectedRoute>
        ),
      },
      {
        path: "/vendor/edit-products/:productId",
        element: (
          <ProtectedRoute requiredRole="vendor">
            <Products />
          </ProtectedRoute>
        ),
      },

      {
        path: "/vendor/dashboard",
        element: (
          <ProtectedRoute requiredRole="vendor">
            <VendorDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/vendor/products",
        element: (
          <ProtectedRoute requiredRole="vendor">
            <ProductGrid />
          </ProtectedRoute>
        ),
      },
      {
        path: "/vendor/advertisements",
        element: (
          <ProtectedRoute requiredRole="vendor">
            <AddAdvertisementForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "/vendor/advertisements/:id",
        element: (
          <ProtectedRoute requiredRole="vendor">
            <AddAdvertisementForm />
          </ProtectedRoute>
        ),
      },
      {
        path: "/vendor/payment",
        element: (
          <ProtectedRoute requiredRole="vendor">
            <VendorBannerPayment />
          </ProtectedRoute>
        ),
      },
      {
        path: "/vendor/displayAdvertisements",
        element: (
          <ProtectedRoute requiredRole="vendor">
            <OffersGrid />
          </ProtectedRoute>
        ),
      },

      { path: "*", element: <div>404 - Page Not Found</div> },
    ],
  },
  { path: "/register", element: <Register /> },
  { path: "/login", element: <Login /> },
]);

function App() {
  return (
    <div className='app'>
      <div className='container-fluid'>
        <RouterProvider router={router} />
      </div>
    </div>
  );
}

export default App;
