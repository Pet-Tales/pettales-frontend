import { Outlet } from "react-router-dom";
import PTAINavBar from "./navbar";

const MainLayout = () => {
  return (
    <>
      <PTAINavBar />
      <div className="mt-[70px] min-h-[calc(100vh-70px)] bg-gray-100">
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
