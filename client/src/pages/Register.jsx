// import React, { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { useAuth } from "../context/authContext";
// import { registerUser } from "../services/Auth/authService";
// import { ToastContainer, toast } from "react-toastify";
// import 'react-toastify/dist/ReactToastify.css';
// import { Form, Button, Card, Container, Spinner, Alert } from "react-bootstrap";

// const Register = () => {
//   const [inputs, setInputs] = useState({
//     username: "",
//     email: "",
//     password: "",
//     phone: "",
//     role: "user",
//     img: null,
//   });

//   const [errors, setErrors] = useState({});
//   const [loading, setLoading] = useState(false);
//   const [previewImage, setPreviewImage] = useState(null);
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const validateForm = () => {
//     const newErrors = {};
    
//     if (!inputs.username.trim()) {
//       newErrors.username = "Username is required";
//     } else if (inputs.username.trim().length < 3) {
//       newErrors.username = "Username must be at least 3 characters long";
//     }
    
//     if (!inputs.email.trim()) {
//       newErrors.email = "Email is required";
//     } else if (!/\S+@\S+\.\S+/.test(inputs.email)) {
//       newErrors.email = "Email is not valid";
//     }
    
//     if (!inputs.password) {
//       newErrors.password = "Password is required";
//     } else if (inputs.password.length < 6) {
//       newErrors.password = "Password must be at least 6 characters long";
//     }
    
//     if (!inputs.phone.trim()) {
//       newErrors.phone = "Phone number is required";
//     } else if (!/^\d{10,}$/.test(inputs.phone.replace(/[^0-9]/g, ''))) {
//       newErrors.phone = "Phone number must have at least 10 digits";
//     }
    
//     if (!inputs.img) {
//       newErrors.img = "Profile image is required";
//     }
    
//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setInputs((prev) => ({ ...prev, [name]: value }));
    
//     // Clear error when user starts typing
//     if (errors[name]) {
//       setErrors(prev => ({ ...prev, [name]: "" }));
//     }
//   };

//   const handleRoleChange = (e) => {
//     setInputs((prev) => ({ ...prev, role: e.target.value }));
//   };

//   const handleImageChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       setInputs((prev) => ({ ...prev, img: file }));
//       setPreviewImage(URL.createObjectURL(file));
      
//       // Clear image error when file is selected
//       if (errors.img) {
//         setErrors(prev => ({ ...prev, img: "" }));
//       }
//     }
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!validateForm()) {
//       return;
//     }

//     const formData = new FormData();
//     formData.append("username", inputs.username);
//     formData.append("email", inputs.email);
//     formData.append("password", inputs.password);
//     formData.append("phone", inputs.phone);
//     formData.append("role", inputs.role);
//     formData.append("img", inputs.img);

//     setLoading(true);

//     try {
//       const { data, status } = await registerUser(formData);

//       console.log({data});
      

//       if (status !== 201) {
//         toast.error(data.error || "Registration failed");
//         setLoading(false);
//         return;
//       }

//       toast.success("Registration successful!");

//       // Set login using context
//       login({ 
//         id: data.user.id, 
//         email: data.user.email, 
//         role: data.user.role, 
//         onboardingstep: data.user.onboardingstep 
//       }, data.token);

//       // Navigate after successful registration
//       setTimeout(() => {
//         if (inputs.role === "vendor") {
//           navigate("/vendor/register-business");
//         } else {
//           navigate("/user/your-favourite-notes");
//         }
//       }, 1000); // Small delay to show toast

//     } catch (err) {
//       console.error("Registration error:", err);
//       const errorMessage = err.response?.data || "Registration failed. Please try again.";
      
//       // Handle specific error cases
//       if (typeof errorMessage === 'string' && errorMessage.includes("already exists")) {
//         if (errorMessage.includes("User already exists")) {
//           setErrors(prev => ({ ...prev, email: "Email is already registered" }));
//           toast.error("Email is already registered");
//         } else if (errorMessage.includes("Phone number is already registered")) {
//           setErrors(prev => ({ ...prev, phone: "Phone number is already registered" }));
//           toast.error("Phone number is already registered");
//         } else {
//           toast.error(errorMessage);
//         }
//       } else {
//         toast.error("Registration failed. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Container className="d-flex justify-content-center align-items-center vh-100">
//       <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      
//       <Card className="p-4 w-100" style={{ maxWidth: "500px" }}>
//         <h2 className="mb-4 text-center">Register</h2>
//         <Form onSubmit={handleSubmit}>
//           <Form.Group className="mb-3">
//             <Form.Control
//               type="text"
//               name="username"
//               placeholder="Username"
//               value={inputs.username}
//               onChange={handleChange}
//               isInvalid={!!errors.username}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.username}
//             </Form.Control.Feedback>
//           </Form.Group>
          
//           <Form.Group className="mb-3">
//             <Form.Control
//               type="email"
//               name="email"
//               placeholder="Email"
//               value={inputs.email}
//               onChange={handleChange}
//               isInvalid={!!errors.email}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.email}
//             </Form.Control.Feedback>
//           </Form.Group>
          
//           <Form.Group className="mb-3">
//             <Form.Control
//               type="password"
//               name="password"
//               placeholder="Password"
//               value={inputs.password}
//               onChange={handleChange}
//               isInvalid={!!errors.password}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.password}
//             </Form.Control.Feedback>
//           </Form.Group>
          
//           <Form.Group className="mb-3">
//             <Form.Control
//               type="text"
//               name="phone"
//               placeholder="Phone Number"
//               value={inputs.phone}
//               onChange={handleChange}
//               isInvalid={!!errors.phone}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.phone}
//             </Form.Control.Feedback>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label className="me-3">Role:</Form.Label>
//             <div className="d-flex">
//               <Form.Check
//                 type="radio"
//                 id="role-user"
//                 name="role"
//                 value="user"
//                 checked={inputs.role === "user"}
//                 onChange={handleRoleChange}
//                 label="User"
//                 className="me-3"
//               />
//               <Form.Check
//                 type="radio"
//                 id="role-vendor"
//                 name="role"
//                 value="vendor"
//                 checked={inputs.role === "vendor"}
//                 onChange={handleRoleChange}
//                 label="Vendor"
//               />
//             </div>
//           </Form.Group>

//           <Form.Group className="mb-3">
//             <Form.Label>Profile Image <span className="text-danger">*</span></Form.Label>
//             <Form.Control
//               type="file"
//               name="img"
//               onChange={handleImageChange}
//               isInvalid={!!errors.img}
//             />
//             <Form.Control.Feedback type="invalid">
//               {errors.img}
//             </Form.Control.Feedback>
            
//             {previewImage && (
//               <div className="mt-2 text-center">
//                 <img 
//                   src={previewImage} 
//                   alt="Profile Preview" 
//                   style={{
//                     width: "100px",
//                     height: "100px",
//                     objectFit: "cover",
//                     borderRadius: "50%"
//                   }}
//                 />
//               </div>
//             )}
//           </Form.Group>

//           <Button 
//             variant="primary" 
//             type="submit" 
//             className="w-100" 
//             disabled={loading}
//           >
//             {loading ? (
//               <>
//                 <Spinner
//                   as="span"
//                   animation="border"
//                   size="sm"
//                   role="status"
//                   aria-hidden="true"
//                   className="me-2"
//                 />
//                 Registering...
//               </>
//             ) : (
//               "Register"
//             )}
//           </Button>

//           <p className="mt-3 text-center">
//             Already have an account? <Link to="/login">Login</Link>
//           </p>
//         </Form>
//       </Card>
//     </Container>
//   );
// };

// export default Register;

// Register.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { registerUser } from "../services/Auth/authService";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { Form, Button, Card, Container, Spinner, Alert } from "react-bootstrap";

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    img: null,
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = () => {
    const newErrors = {};
    
    if (!inputs.username.trim()) {
      newErrors.username = "Username is required";
    } else if (inputs.username.trim().length < 3) {
      newErrors.username = "Username must be at least 3 characters long";
    }
    
    if (!inputs.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(inputs.email)) {
      newErrors.email = "Email is not valid";
    }
    
    if (!inputs.password) {
      newErrors.password = "Password is required";
    } else if (inputs.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }
    
    if (!inputs.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10,}$/.test(inputs.phone.replace(/[^0-9]/g, ''))) {
      newErrors.phone = "Phone number must have at least 10 digits";
    }
    
    if (!inputs.img) {
      newErrors.img = "Profile image is required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setInputs((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const handleRoleChange = (e) => {
    setInputs((prev) => ({ ...prev, role: e.target.value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setInputs((prev) => ({ ...prev, img: file }));
      setPreviewImage(URL.createObjectURL(file));
      
      // Clear image error when file is selected
      if (errors.img) {
        setErrors(prev => ({ ...prev, img: "" }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    const formData = new FormData();
    formData.append("username", inputs.username);
    formData.append("email", inputs.email);
    formData.append("password", inputs.password);
    formData.append("phone", inputs.phone);
    formData.append("role", inputs.role);
    formData.append("img", inputs.img);

    setLoading(true);

    try {
      const { data, status } = await registerUser(formData);

      console.log({data});
      
      if (status !== 201) {
        toast.error(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      toast.success("Registration successful!");

      // Set login using context
      login({ 
        id: data.user.id, 
        email: data.user.email, 
        role: data.user.role, 
        onboardingstep: data.user.onboardingstep 
      }, data.token);

      // Navigate after successful registration
      setTimeout(() => {
        if (inputs.role === "vendor") {
          navigate("/vendor/register-business");
        } else {
          navigate("/user/your-favourite-notes");
        }
      }, 1000); // Small delay to show toast

    } catch (err) {
      console.error("Registration error:", err);
      const errorMessage = err.response?.data || "Registration failed. Please try again.";
      
      // Handle specific error cases
      if (typeof errorMessage === 'string' && errorMessage.includes("already exists")) {
        if (errorMessage.includes("User already exists")) {
          setErrors(prev => ({ ...prev, email: "Email is already registered" }));
          toast.error("Email is already registered");
        } else if (errorMessage.includes("Phone number is already registered")) {
          setErrors(prev => ({ ...prev, phone: "Phone number is already registered" }));
          toast.error("Phone number is already registered");
        } else {
          toast.error(errorMessage);
        }
      } else {
        toast.error("Registration failed. Please try again.");
      }
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
      <Container className="d-flex justify-content-center align-items-center">
        <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
        
        <Card className="shadow-lg border-0" style={{ 
          maxWidth: "550px", 
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
              Create Your Account
            </h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  placeholder="Enter your username"
                  value={inputs.username}
                  onChange={handleChange}
                  isInvalid={!!errors.username}
                  className="py-2"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.username}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={inputs.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  className="py-2"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.email}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Create a password"
                  value={inputs.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  className="py-2"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.password}
                </Form.Control.Feedback>
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phone"
                  placeholder="Enter your phone number"
                  value={inputs.phone}
                  onChange={handleChange}
                  isInvalid={!!errors.phone}
                  className="py-2"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.phone}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>I am registering as:</Form.Label>
                <div className="d-flex">
                  <Form.Check
                    type="radio"
                    id="role-user"
                    name="role"
                    value="user"
                    checked={inputs.role === "user"}
                    onChange={handleRoleChange}
                    label=" User"
                    className="me-4"
                  />
                  <Form.Check
                    type="radio"
                    id="role-vendor"
                    name="role"
                    value="vendor"
                    checked={inputs.role === "vendor"}
                    onChange={handleRoleChange}
                    label=" Vendor"
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Profile Image <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="file"
                  name="img"
                  onChange={handleImageChange}
                  isInvalid={!!errors.img}
                  className="py-2"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.img}
                </Form.Control.Feedback>
                
                {previewImage && (
                  <div className="mt-3 text-center">
                    <img 
                      src={previewImage} 
                      alt="Profile Preview" 
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "50%",
                        border: "3px solid #0d6efd"
                      }}
                    />
                  </div>
                )}
              </Form.Group>

              <Button 
                variant="primary" 
                type="submit" 
                className="w-100 py-2 mt-2" 
                disabled={loading}
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "600",
                  boxShadow: "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)"
                }}
              >
                {loading ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-2"
                    />
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>

              <div className="mt-4 text-center">
                <p>
                  Already have an account?{" "}
                  <Link to="/login" style={{ 
                    color: "#0d6efd", 
                    fontWeight: "600",
                    textDecoration: "none"
                  }}>
                    Sign In
                  </Link>
                </p>
              </div>
            </Form>
          </Card.Body>
          <div className="text-center p-3 bg-light">
            <small className="text-muted">
              By creating an account, you agree to our <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>
            </small>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Register;