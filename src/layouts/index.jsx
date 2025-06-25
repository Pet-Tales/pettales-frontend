import { Outlet } from "react-router-dom";
import PTAINavBar from "./navbar";

const MainLayout = () => {
  return (
    <>
      <PTAINavBar />
      <div className="mt-[70px]">
        <Outlet />
      </div>
    </>
  );
};

export default MainLayout;
