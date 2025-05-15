import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext, useAuth } from "../context/authContext";
import { registerUser } from "../services/Auth/authService";

const Register = () => {
  const [inputs, setInputs] = useState({
    username: "",
    email: "",
    password: "",
    phone: "",
    role: "user",
    img: null,
  });

  const [err, setError] = useState(null);
  const [loading, setLoading] = useState(false); // <-- Loader state
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleChange = (e) => {
    setInputs((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleRoleChange = (e) => {
    setInputs((prev) => ({ ...prev, role: e.target.value }));
  };

  const handleImageChange = (e) => {
    setInputs((prev) => ({ ...prev, img: e.target.files[0] }));
    setError(null); 
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!inputs.img) {
      setError("Profile image is required.");
      return;
    }

    const formData = new FormData();
    formData.append("username", inputs.username);
    formData.append("email", inputs.email);
    formData.append("password", inputs.password);
    formData.append("phone", inputs.phone);
    formData.append("role", inputs.role);
    formData.append("img", inputs.img);

    setLoading(true); // Start loading spinner

    try {
      const { data, status } = await registerUser(formData);

      if (status !== 201) {
        setError(data.error || "Registration failed");
        setLoading(false);
        return;
      }

      setError('');

      console.log({data});
      

      // Set login using context
      login({ 
        id: data.user.id, 
        email: data.user.email, 
        role: data.user.role, 
        onboardingstep: data.user.onboardingstep 
      }, data.token);

      // Navigate after successful registration
      if (inputs.role === "vendor") {
        navigate("/vendor/register-business");
      } else {
        navigate("/user/your-favourite-notes");
      }

    } catch (err) {
      console.log(err);
      setError(err.response?.data || "Registration failed");
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="card p-4 w-100" style={{ maxWidth: "500px" }}>
        <h2 className="mb-4 text-center">Register</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <input
              required
              type="text"
              className="form-control"
              placeholder="Username"
              name="username"
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              required
              type="email"
              className="form-control"
              placeholder="Email"
              name="email"
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              required
              type="password"
              className="form-control"
              placeholder="Password"
              name="password"
              onChange={handleChange}
            />
          </div>
          <div className="mb-3">
            <input
              required
              type="text"
              className="form-control"
              placeholder="Phone Number"
              name="phone"
              onChange={handleChange}
            />
          </div>

          <div className="mb-3">
            <label className="form-label me-3">Role:</label>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="role"
                value="user"
                checked={inputs.role === "user"}
                onChange={handleRoleChange}
              />
              <label className="form-check-label">User</label>
            </div>
            <div className="form-check form-check-inline">
              <input
                className="form-check-input"
                type="radio"
                name="role"
                value="vendor"
                checked={inputs.role === "vendor"}
                onChange={handleRoleChange}
              />
              <label className="form-check-label">Vendor</label>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label">Profile Image</label>
            <input
              type="file"
              className="form-control"
              name="img"
              onChange={handleImageChange}
            />
          </div>

          <button type="submit" className="btn btn-primary w-100" disabled={loading}>
            {loading ? (
              <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            ) : (
              "Register"
            )}
          </button>

          {err && <div className="alert alert-danger mt-3">{err}</div>}

          <p className="mt-3 text-center">
            Already have an account? <Link to="/login">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;
