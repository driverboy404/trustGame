import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("https://trustgame.onrender.com/api/message")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch((err) => setMessage("AAA ERROR connecting to backend"));
  }, []);

  return (
    <div>
      <h1>React Frontend AAAAAAAA</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;
