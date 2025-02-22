import { useEffect, useState } from "react";

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("https://trustgame.onrender.com/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message));
  }, []);

  return (
    <div>
      <h1>Prisoner's Dilemma</h1>
      <p>Backend says: {message}</p>
    </div>
  );
}

export default App;
