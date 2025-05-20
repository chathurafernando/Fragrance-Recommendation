import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Logo from "../img/logo.png";

const Navbar = () => {
  const { logout, user, onboardingstep } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const isLimitedNavbar = onboardingstep == 3 || onboardingstep == 6;

  console.log("Cstep:", isLimitedNavbar); // Debugging log

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">

        {!user && (
          <>
            <img src={Logo} alt="Logo" height="40" />
          </>
        )}

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {user && (
              <>

                {isLimitedNavbar && (
                  <>
                    {/* User-specific links */}
                    {user.role === "user" && (
                      <>
                        <li className="nav-item">
                          <Link className="nav-link small" to="/user/dashboard">
                            <img src={Logo} alt="Logo" height="40" />
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link small" to="/user/dashboard">
                            Explore
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link small" to="/user/offers">
                            Offers
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link small" to="/user/wishlist">
                            Profile
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link small" to="/user/filter">
                            Finder
                          </Link>
                        </li>
                      </>
                    )}

                    {/* Vendor-specific links */}
                    {user.role === "vendor" && (
                      <>
                        <li className="nav-item">
                          <Link className="nav-link small" to="/vendor/dashboard">
                            <img src={Logo} alt="Logo" height="40" />
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link small" to="/vendor/dashboard">
                            My Profile
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link small" to="/vendor/advertisements">
                            Add Advertisements
                          </Link>
                        </li>
                        <li className="nav-item">
                          <Link className="nav-link small" to="/vendor/add-products">
                            Add Products
                          </Link>
                        </li>
                      </>
                    )}
                  </>)}
                <>
                  {user.role === "admin" && (
                    <>
                      <li className="nav-item">
                        <Link className="nav-link small" to="/admin">
                          <img src={Logo} alt="Logo" height="40" />
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link small" to="/admin/overview">
                          Overview Report
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link small" to="/admin/manage-notes">
                          Manage Notes
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link small" to="/admin/manage-perfume">
                          Manage Fragrances
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link small" to="/admin/manage-brands">
                          Manage Brands
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link small" to="/admin/manage-users">
                          Manage Users
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link small" to="/admin/add-business">
                          Add Business Entry
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link small" to="/admin/add-business-form">
                          Business Form
                        </Link>
                      </li>
                      <li className="nav-item">
                        <Link className="nav-link small" to="/admin/add-vendor-form">
                          Vendor Form
                        </Link>
                      </li>
                    </>
                  )}

                </>


              </>
            )}
          </ul>

          <div className="d-flex align-items-center">
            {user ? (
              <>
                <span className="navbar-text me-3">
                  Welcome, {user.email || "User"}
                </span>
                <button
                  onClick={handleLogout}
                  className="btn btn-outline-danger"
                >
                  Logout
                </button>
              </>
            ) : (
              <Link to="/login" className="btn btn-primary">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;