import "./App.css";
const VITE_DEBUG_MODE_ENV = import.meta.env.VITE_DEBUG_MODE_ENV;
const DEBUG_MODE = VITE_DEBUG_MODE_ENV !== "false";
function App() {
  return (
    <>
      <h1 className="">
        Pet Tales AI - {DEBUG_MODE ? "Staging" : "Production"} Environment
      </h1>
    </>
  );
}

export default App;
