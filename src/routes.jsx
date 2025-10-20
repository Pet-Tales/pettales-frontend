import { Navigate } from "react-router-dom";
import MainLayout from "@/layouts";
import ProtectedRoute from "@/components/ProtectedRoute";
import Error404 from "@/pages/Error/404";
import Error500 from "@/pages/Error/500";
import Home from "@/pages/Home";
import CharitiesAdmin from "@/pages/Admin/Charities";
import AdminLayout from "@/pages/Admin/AdminLayout";
import AdminDashboardHome from "@/pages/Admin/Dashboard";

import MyBooks from "@/pages/MyBooks";
import Characters from "@/pages/Characters";
import CreateCharacter from "@/pages/Characters/CreateCharacter";
import EditCharacter from "@/pages/Characters/EditCharacter";
import CharacterDetails from "@/pages/Characters/CharacterDetails";
import CreateBook from "@/pages/Books/CreateBook";
import BookDetail from "@/pages/Books/BookDetail";
import PrintOrder from "@/pages/PrintOrder";
import Orders from "@/pages/Orders";
import OrderDetail from "@/pages/Orders/OrderDetail";
import Gallery from "@/pages/Gallery";
import Profile from "@/pages/Profile";
import Blog from "@/pages/Blog";
import BlogPost from "@/pages/Blog/Post.jsx";
import Pricing from "@/pages/Pricing";
import { PrivacyPolicy, TermsOfService } from "@/pages/Legal";
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
  path: "/books/:id/print-order",
  element: <PrintOrder />,
},
      {
        path: "/my-orders",
        element: (
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        ),
      },
      {
        path: "/my-orders/:orderId",
        element: (
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        ),
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
        path: "/pricing",
        element: <Navigate to="/blog" replace />,
      },
      {
        path: "/blog",
        element: <Blog />,
      },
      {
        path: "/blog/:slug",
        element: <BlogPost />,
      },
      {
        path: "/privacy-policy",
        element: <PrivacyPolicy />,
      },
      {
        path: "/terms-of-service",
        element: <TermsOfService />,
      },
      {
        path: "/error/500",
        element: <Error500 />,
      },
      {
        path: "*", // go to 404 error page when cannot find route
        element: <Error404 />,
      },
      // Admin root
      {
        path: "/admin",
        element: (
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "", element: <AdminDashboardHome /> },
          { path: "charities", element: <CharitiesAdmin /> },
        ],
      },
    ],
  },
];

export default Routes;
