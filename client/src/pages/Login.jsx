// import axios from "axios";
// import React, { useContext, useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { AuthContext } from "../context/authContext";

// const Login = () => {
//   const [inputs, setInputs] = useState({
//     username: "",
//     password: "",
//   });
//   const [err, setError] = useState(null);
//   const navigate = useNavigate();
//   const { login } = useContext(AuthContext);

//   const handleChange = (e) => {
//     setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const user = await login(inputs); // Call the login function and get the user data

//       console.log("Login Response:", user); // Log the user data to check the role
//       console.log("User Role:", user?.role); // Ensure role is available

//       if (user?.role === "admin") {
//         navigate("/admin"); // Redirect to Admin Dashboard
//       } else {
//         navigate("/"); // Redirect to Home
//       }
//     } catch (err) {
//       setError(err.response?.data || "Login failed");
//     }
//   };

//   return (
//     <div className="auth">
//       <h1>Login</h1>
//       <input
//         type="text"
//         placeholder="Username"
//         name="username"
//         onChange={handleChange}
//       />
//       <input
//         type="password"
//         placeholder="Password"
//         name="password"
//         onChange={handleChange}
//       />
//       <button onClick={handleSubmit}>Login</button>
//       {err && <p>{err.message || err}</p>}

//       <span>
//         Don't have an account? <Link to="/register">Register</Link>
//       </span>
//     </div>
//   );
// };

// export default Login;
// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Form, Button, Container, Spinner, Toast, ToastContainer, Alert } from "react-bootstrap";
// import { useAuth } from "../context/authContext.js";
// import { loginUser } from "../services/Auth/authService.js";

// const Login = () => {
//   const [formData, setFormData] = useState({
//     email: "",
//     password: "",
//   });
//   const [formErrors, setFormErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [toasts, setToasts] = useState([]);
//   const [serverError, setServerError] = useState("");

//   const navigate = useNavigate();
//   const { login } = useAuth();
//  useEffect(() => {
//     // Clear server error when form data changes
//     if (serverError) {
//       setServerError("");
//     }
//   }, [formData]);
//   const showToast = (message, type = "success") => {
//     const newToast = {
//       id: Date.now(),
//       message,
//       type
//     };
//     setToasts(prev => [...prev, newToast]);
//   };

//   const validateForm = () => {
//     const errors = {};
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//     if (!formData.email.trim()) {
//       errors.email = "Email is required";
//     } else if (!emailRegex.test(formData.email)) {
//       errors.email = "Please enter a valid email address";
//     }

//     if (!formData.password) {
//       errors.password = "Password is required";
//     } else if (formData.password.length < 5) {
//       errors.password = "Password must be at least 5 characters";
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));

//     // Clear error when user starts typing
//     if (formErrors[name]) {
//       setFormErrors(prev => ({ ...prev, [name]: "" }));
//     }

//     // Clear server error when user makes any change
//     if (serverError) {
//       setServerError("");
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!validateForm()) return;

//     setLoading(true);

//     try {
//       const response = await loginUser(formData);
//       const { data, status } = response;

//       // Check for error response
//       if (status !== 200 || data.status === 'error') {
//         // Handle structured error response from backend
//         const errorMessage = data.message || "Login failed";
//         showToast(errorMessage, "danger");

//         // Handle specific field validation errors from backend
//         if (data.validationErrors) {
//           const backendErrors = {};

//           if (data.validationErrors.email) {
//             backendErrors.email = data.validationErrors.email;
//           }

//           if (data.validationErrors.password) {
//             backendErrors.password = data.validationErrors.password;
//           }

//           if (Object.keys(backendErrors).length > 0) {
//             setFormErrors(prev => ({ ...prev, ...backendErrors }));
//           }
//         }
//         return;
//       }

//       // Successful login
//       login(
//         { 
//           id: data.user.id, 
//           email: data.user.email, 
//           role: data.user.role, 
//           onboardingstep: data.user.onboardingstep,
//           name: data.user.name
//         }, 
//         data.token
//       );

//       showToast(data.message || "Login successful!", "success");

//       // Redirect based on user role
//       if (data.user.role === 'admin') {
//         navigate('/admin');
//       } else if (data.user.role === 'vendor') {
//         navigate('/vendor/register-business');
//       } else {
//         navigate('/user/your-favourite-notes');
//       }
//     } catch (err) {
//       // Handle various error response formats
//       let errorMsg;

//       if (err.response) {
//         const responseData = err.response.data;

//         // Try to extract the error message based on our backend response structure
//         errorMsg = responseData.message || 
//                   responseData.error || 
//                   (typeof responseData === "string" ? responseData : null);

//         // Handle field-specific validation errors
//         if (responseData.validationErrors) {
//           setFormErrors(prev => ({ ...prev, ...responseData.validationErrors }));
//         }

//         // Set server error for display in the form
//         setServerError(errorMsg || "Login failed. Please try again.");
//       } else {
//         // Network errors or other issues
//         errorMsg = "Network error. Please check your connection.";
//         setServerError(errorMsg);
//       }

//       showToast(errorMsg || "Login failed. Please try again.", "danger");

//       // Log error for debugging
//       console.error("Login error:", err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container className="d-flex justify-content-center align-items-center vh-100">
//       <ToastContainer position="top-end" className="p-3">
//         {toasts.map(toast => (
//           <Toast 
//             key={toast.id}
//             onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
//             show={true} 
//             delay={5000} 
//             autohide
//             bg={toast.type}
//           >
//             <Toast.Header>
//               <strong className="me-auto">Notification</strong>
//             </Toast.Header>
//             <Toast.Body className={toast.type === "danger" ? "text-white" : ""}>
//               {toast.message}
//             </Toast.Body>
//           </Toast>
//         ))}
//       </ToastContainer>

//       <div className="card p-4 w-100" style={{ maxWidth: "500px" }}>
//         <h2 className="mb-4 text-center">Login</h2>

//         {serverError && (
//           <Alert variant="danger" className="mb-3">
//             {serverError}
//           </Alert>
//         )}

//         <Form onSubmit={handleSubmit}>
//           <Form.Group className="mb-3">
//             <Form.Control
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={formData.email}
//               onChange={handleInputChange}
//               isInvalid={!!formErrors.email}
//             />
//             <Form.Control.Feedback type="invalid">
//               {formErrors.email}
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Control
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={formData.password}
//               onChange={handleInputChange}
//               isInvalid={!!formErrors.password}
//             />
//             <Form.Control.Feedback type="invalid">
//               {formErrors.password}
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Button type="submit" variant="primary" className="w-100" disabled={loading}>
//             {loading ? (
//               <>
//                 <Spinner animation="border" size="sm" className="me-2" />
//                 Logging in...
//               </>
//             ) : (
//               "Login"
//             )}
//           </Button>
//         </Form>

//         <p className="mt-3 text-center">
//           Don't have an account? <Link to="/register">Register</Link>
//         </p>
//       </div>
//     </Container>
//   );
// };

// export default Login;

// Login.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Container, Spinner, Toast, ToastContainer, Alert, Card } from "react-bootstrap";
import { useAuth } from "../context/authContext.js";
import { loginUser } from "../services/Auth/authService.js";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [serverError, setServerError] = useState("");

  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Clear server error when form data changes
    if (serverError) {
      setServerError("");
    }
  }, [formData]);

  const showToast = (message, type = "success") => {
    const newToast = {
      id: Date.now(),
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email.trim()) {
      errors.email = "Email is required";
    } else if (!emailRegex.test(formData.email)) {
      errors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      errors.password = "Password is required";
    } else if (formData.password.length < 5) {
      errors.password = "Password must be at least 5 characters";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }

    // Clear server error when user makes any change
    if (serverError) {
      setServerError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    try {
      const response = await loginUser(formData);
      const { data, status } = response;

      // Check for error response
      if (status !== 200 || data.status === 'error') {
        // Handle structured error response from backend
        const errorMessage = data.message || "Login failed";
        showToast(errorMessage, "danger");

        // Handle specific field validation errors from backend
        if (data.validationErrors) {
          const backendErrors = {};

          if (data.validationErrors.email) {
            backendErrors.email = data.validationErrors.email;
          }

          if (data.validationErrors.password) {
            backendErrors.password = data.validationErrors.password;
          }

          if (Object.keys(backendErrors).length > 0) {
            setFormErrors(prev => ({ ...prev, ...backendErrors }));
          }
        }
        return;
      }

      // Successful login
      login(
        {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          onboardingstep: data.user.onboardingstep,
          name: data.user.name
        },
        data.token
      );

      showToast(data.message || "Login successful!", "success");

      // Redirect based on user role
      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'vendor') {
        navigate('/vendor/register-business');
      } else {
        navigate('/user/your-favourite-notes');
      }
    } catch (err) {
      // Handle various error response formats
      let errorMsg;

      if (err.response) {
        const responseData = err.response.data;

        // Try to extract the error message based on our backend response structure
        errorMsg = responseData.message ||
          responseData.error ||
          (typeof responseData === "string" ? responseData : null);

        // Handle field-specific validation errors
        if (responseData.validationErrors) {
          setFormErrors(prev => ({ ...prev, ...responseData.validationErrors }));
        }

        // Set server error for display in the form
        setServerError(errorMsg || "Login failed. Please try again.");
      } else {
        // Network errors or other issues
        errorMsg = "Network error. Please check your connection.";
        setServerError(errorMsg);
      }

      showToast(errorMsg || "Login failed. Please try again.", "danger");

      // Log error for debugging
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper" style={{
      background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px"
    }}>
      <ToastContainer position="top-end" className="p-3">
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            onClose={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
            show={true}
            delay={5000}
            autohide
            bg={toast.type}
          >
            <Toast.Header>
              <strong className="me-auto">Notification</strong>
            </Toast.Header>
            <Toast.Body className={toast.type === "danger" ? "text-white" : ""}>
              {toast.message}
            </Toast.Body>
          </Toast>
        ))}
      </ToastContainer>

      <Container className="d-flex justify-content-center align-items-center">
        <Card className="shadow-lg border-0" style={{
          maxWidth: "500px",
          width: "100%",
          borderRadius: "15px",
          overflow: "hidden"
        }}>
          <div className="text-center py-4 bg-primary text-white" style={{
            borderBottom: "4px solid #0056b3"
          }}>
            <h1 className="brand-logo mb-2" style={{
              fontWeight: "700",
              fontSize: "2.5rem",
              textShadow: "2px 2px 4px rgba(0,0,0,0.2)"
            }}>
              Perfume Zone
            </h1>
            <p className="brand-tagline m-0" style={{ fontSize: "1rem" }}>
              Share your Perfume with the world

            </p>
          </div>

          <Card.Body className="p-4 p-md-5">
            <h2 className="mb-4 text-center" style={{ color: "#333", fontWeight: "600" }}>
              Welcome Back
            </h2>

            {serverError && (
              <Alert variant="danger" className="mb-4">
                {serverError}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-4">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.email}
                  className="py-2"
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.email}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleInputChange}
                  isInvalid={!!formErrors.password}
                  className="py-2"
                />
                <Form.Control.Feedback type="invalid">
                  {formErrors.password}
                </Form.Control.Feedback>
              </Form.Group>

              <div className="d-flex justify-content-end mb-4">
                <Link to="/forgot-password" style={{
                  color: "#0d6efd",
                  textDecoration: "none",
                  fontWeight: "500"
                }}>
                  Forgot Password?
                </Link>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2"
                disabled={loading}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)"
                }}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Signing In...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>
            </Form>

            <div className="mt-4 text-center">
              <p>
                Don't have an account?{" "}
                <Link to="/register" style={{
                  color: "#0d6efd",
                  fontWeight: "600",
                  textDecoration: "none"
                }}>
                  Create Account
                </Link>
              </p>
            </div>
          </Card.Body>
          <div className="text-center p-3 bg-light">
            <small className="text-muted">
              © 2025 Perfume Zone. All rights reserved.
            </small>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Login;