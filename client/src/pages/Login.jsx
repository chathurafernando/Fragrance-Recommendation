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
import axios from "axios";
import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, useAuth } from "../context/authContext.js";
import { loginUser } from "../services/Auth/authService.js";

const Login = () => {
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
  });

  const [err, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth(); // Use the login function from AuthContext
  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {

      const { data, status } = await loginUser(inputs);

      if (status !== 200) {
        setError(data.error || 'Login failed');
        return;
      }

      setError('');

      login({ id: data.user.id, email: data.user.email, role: data.user.role, onboardingstep: data.user.onboardingstep }, data.token);

      if (data.user.role === 'admin') {
        navigate('/admin');
      } else if (data.user.role === 'vendor') {
        navigate('/vendor/register-business');
      } else {
        navigate('/user/your-favourite-notes');
      }
    } catch (err) {
      setError(err.response?.data || "Login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 w-100" style={{ maxWidth: "500px" }}>
        <h2 className="mb-4 text-center">Login</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              type="email"
              className="form-control"
              placeholder="Email"
              name="email"
              required
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              type="password"
              className="form-control"
              placeholder="Password"
              name="password"
              required
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn btn-primary w-100">
            Login
          </button>

          {err && (
            <div className="alert alert-danger mt-3">
              {err.message || err}
            </div>
          )}

          <p className="mt-3 text-center">
            Don’t have an account? <Link to="/register">Register</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
