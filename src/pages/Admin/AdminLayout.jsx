import { NavLink, Outlet } from "react-router-dom";
import { useSelector } from "react-redux";

const AdminLayout = () => {
  const { user } = useSelector((s) => s.auth);
  const isAdmin = user?.role === "admin";

  if (!isAdmin) {
    return (
      <div className="p-6">
        <h2 className="text-xl font-semibold">Admin access required</h2>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-70px)] bg-gray-100">
      <div className="mx-auto max-w-7xl px-4 py-6 grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Sidebar */}
        <aside className="md:col-span-3 lg:col-span-2">
          <nav className="bg-white rounded border shadow-sm p-3 space-y-1">
            <NavLink
              end
              to="/admin"
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium ${
                  isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/charities"
              className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm font-medium ${
                  isActive ? "bg-gray-100 text-gray-900" : "text-gray-700 hover:bg-gray-50"
                }`
              }
            >
              Charities
            </NavLink>
          </nav>
        </aside>

        {/* Content */}
        <main className="md:col-span-9 lg:col-span-10">
          <div className="bg-white rounded border shadow-sm p-4">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

