import MainLayout from "@/layouts";
import Error404 from "@/pages/Error/404";
import Error500 from "@/pages/Error/500";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import MyBooks from "@/pages/MyBooks";
import Characters from "@/pages/Characters";
import CreateCharacter from "@/pages/Characters/CreateCharacter";
import EditCharacter from "@/pages/Characters/EditCharacter";
import CharacterDetails from "@/pages/Characters/CharacterDetails";
import Profile from "@/pages/Profile";
import {
  Login,
  Signup,
  VerifyEmail,
  VerifyEmailChange,
  ForgotPassword,
  ResetPassword,
} from "@/pages/Auth";

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
        path: "/verify-email-change",
        element: <VerifyEmailChange />,
      },
      {
        path: "/forgot-password",
        element: <ForgotPassword />,
      },
      {
        path: "/reset-password",
        element: <ResetPassword />,
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
        path: "/characters/create",
        element: <CreateCharacter />,
      },
      {
        path: "/characters/:id",
        element: <CharacterDetails />,
      },
      {
        path: "/characters/:id/edit",
        element: <EditCharacter />,
      },
      {
        path: "/profile",
        element: <Profile />,
      },
      {
        path: "/error/500",
        element: <Error500 />,
      },
      {
        path: "*", // go to 404 error page when cannot find route
        element: <Error404 />,
      },
    ],
  },
];

export default Routes;
