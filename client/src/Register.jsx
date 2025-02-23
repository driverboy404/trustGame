import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [loggedInUser, setLoggedInUser] = useState(null); // Track specific logged-in user
  const [loggedInUsers, setLoggedInUsers] = useState([]);

  useEffect(() => {
    // Check if the user is already logged in when the page loads
    const checkLoggedInUser = async () => {
      try {
        const loggedInUserRes = await axios.get(`${API_URL}/currentUser`, {
          withCredentials: true, // Send cookies with the request
        });

        if (loggedInUserRes.data.user) {
          setLoggedInUser(loggedInUserRes.data.user); // Set your specific user
        }
      } catch (error) {
        console.error("Error fetching logged-in user:", error);
      }
    };

    checkLoggedInUser();
  }, []);

// Handle registration form submission
const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      // Register the user
      const res = await axios.post(`${API_URL}/register`, form, {
        withCredentials: true, // Send cookies along with the request
      });
  
      alert(res.data.message);
  
      // Log the user in immediately after registration
      const loginRes = await axios.post(
        `${API_URL}/login`,
        { email: form.email, password: form.password },
        { withCredentials: true }
      );
  
      alert(loginRes.data.message);
  
      // Set the logged-in user after successful login
      setLoggedInUser(loginRes.data.user);  // Ensure user is returned in the response
    } catch (error) {
      alert(error.response?.data.message || "Registration failed");
    }
  };
  
  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      // Log the user in
      const loginRes = await axios.post(
        `${API_URL}/login`,
        loginForm,
        { withCredentials: true }
      );
  
      alert(loginRes.data.message);
  
      // Set the logged-in user after successful login
      setLoggedInUser(loginRes.data.user);  // Ensure user is returned in the response
    } catch (error) {
      alert(error.response?.data.message || "Login failed");
    }
  };
  

  const handleLogout = async () => {
    try {
      // Logout the user
      const res = await axios.post(
        `${API_URL}/logout`,
        {},
        { withCredentials: true }
      );

      alert(res.data.message);
      setLoggedInUser(null); // Clear logged-in user state
    } catch (error) {
      alert("Logout failed");
    }
  };

  return (
    <div>
      <h1>Register</h1>
      {!loggedInUser ? (
        <>
          <form onSubmit={handleRegisterSubmit}>
            <input
              type="text"
              placeholder="Username"
              onChange={(e) => setForm({ ...form, username: e.target.value })}
            />
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button type="submit">Register</button>
          </form>

          <h1>Login</h1>
          <form onSubmit={handleLoginSubmit}>
            <input
              type="email"
              placeholder="Email"
              onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
            />
            <button type="submit">Login</button>
          </form>
        </>
      ) : (
        <>
          <h2>Welcome, {loggedInUser.username}</h2>
          <button onClick={handleLogout}>Logout</button>
        </>
      )}
    </div>
  );
}

export default Register;




