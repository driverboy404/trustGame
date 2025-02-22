import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("https://trustgame.onrender.com/api/message")
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Backend returned error: ${res.statusText}`);
      }
      return res.json();
    })
    .then((data) => setMessage(data.message))
    .catch((err) => setMessage(`Error: ${err.message}`));
  
  }, []);

  return (
    <div>
      <h1>React Frontend AAAAAAAA</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;
