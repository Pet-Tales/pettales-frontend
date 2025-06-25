import MainLayout from "@/layouts";
import Error404 from "@/pages/Error/404";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import MyBooks from "@/pages/MyBooks";
import Characters from "@/pages/Characters";
import { Login, Signup, VerifyEmail } from "@/pages/Auth";

const Routes = [
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/signup",
        element: <Signup />,
      },
      {
        path: "/verify-email",
        element: <VerifyEmail />,
      },
      {
        path: "/dashboard",
        element: <Dashboard />,
      },
      {
        path: "/my-books",
        element: <MyBooks />,
      },
      {
        path: "/characters",
        element: <Characters />,
      },
      {
        path: "*", // go to 404 error page when cannot find route
        element: <Error404 />,
      },
    ],
  },
];

export default Routes;
