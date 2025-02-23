import { useState } from "react";
import axios from "axios";

function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [loggedInUsers, setLoggedInUsers] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Register the user
      const res = await axios.post(`${API_URL}/register`, form, {
        withCredentials: true, // Send cookies along with the request
      });

      alert(res.data.message);

      // Log the user in immediately after registration
      const loginRes = await axios.post(`${API_URL}/login`, {
        email: form.email,
        password: form.password,
      }, { withCredentials: true });

      alert(loginRes.data.message);

      // Fetch and display the list of logged-in users
      const loggedInUsersRes = await axios.get(`${API_URL}/loggedInUsers`, {
        withCredentials: true, // Send cookies with the request
      });

      setLoggedInUsers(loggedInUsersRes.data.loggedInUsers);

    } catch (error) {
      alert(error.response?.data.message || "Registration failed");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
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

      <h2>Logged-in Users:</h2>
      <ul>
        {loggedInUsers.length > 0 ? (
          loggedInUsers.map((user, index) => <li key={index}>{user}</li>)
        ) : (
          <li>No users logged in</li>
        )}
      </ul>
    </div>
  );
}

export default Register;



