import MainLayout from "@/layouts";
import ProtectedRoute from "@/components/ProtectedRoute";
import Error404 from "@/pages/Error/404";
import Error500 from "@/pages/Error/500";
import Home from "@/pages/Home";
import Dashboard from "@/pages/Dashboard";
import MyBooks from "@/pages/MyBooks";
import Characters from "@/pages/Characters";
import CreateCharacter from "@/pages/Characters/CreateCharacter";
import EditCharacter from "@/pages/Characters/EditCharacter";
import CharacterDetails from "@/pages/Characters/CharacterDetails";
import CreateBook from "@/pages/Books/CreateBook";
import BookDetail from "@/pages/Books/BookDetail";
import Gallery from "@/pages/Gallery";
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
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-books",
        element: (
          <ProtectedRoute>
            <MyBooks />
          </ProtectedRoute>
        ),
      },
      {
        path: "/books/create",
        element: (
          <ProtectedRoute>
            <CreateBook />
          </ProtectedRoute>
        ),
      },
      {
        path: "/books/:id",
        element: <BookDetail />,
      },
      {
        path: "/gallery",
        element: <Gallery />,
      },
      {
        path: "/characters",
        element: (
          <ProtectedRoute>
            <Characters />
          </ProtectedRoute>
        ),
      },
      {
        path: "/characters/create",
        element: (
          <ProtectedRoute>
            <CreateCharacter />
          </ProtectedRoute>
        ),
      },
      {
        path: "/characters/:id",
        element: (
          <ProtectedRoute>
            <CharacterDetails />
          </ProtectedRoute>
        ),
      },
      {
        path: "/characters/:id/edit",
        element: (
          <ProtectedRoute>
            <EditCharacter />
          </ProtectedRoute>
        ),
      },
      {
        path: "/profile",
        element: (
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        ),
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
