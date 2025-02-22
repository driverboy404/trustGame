import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");
  const [visitorCount, setVisitorCount] = useState(0);  // State to hold visitor count

  useEffect(() => {
    // Fetch the visitor count from your backend API
    fetch("https://trustgame.onrender.com/api/visitorCount")
      .then((res) => res.json())
      .then((data) => setVisitorCount(data.visitorCount))
      .catch((err) => setMessage("Error fetching visitor count"));

    // Fetch the backend message
    fetch("https://trustgame.onrender.com/api/message")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage("Error connecting to backend"));
  }, []);  // Empty dependency array means this runs only once on component mount

  return (
    <div>
      <h1>React Frontend</h1>
      <p>Backend says: {message}</p>
      <p>Current active visitors: {visitorCount}</p>  {/* Display visitor count */}
    </div>
  );
}

export default App;
