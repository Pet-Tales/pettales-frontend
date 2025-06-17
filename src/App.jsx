import { useState } from "react";
import "./App.css";
const VITE_DEBUG_MODE_ENV = import.meta.env.VITE_DEBUG_MODE_ENV;
const DEBUG_MODE = VITE_DEBUG_MODE_ENV !== "false";
function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <h1 className="">
        Pet Tales AI - {DEBUG_MODE ? "Staging" : "Production"} Environment
      </h1>
    </>
  );
}

export default App;
