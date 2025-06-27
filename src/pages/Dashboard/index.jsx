import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import ProtectedRoute from "@/components/ProtectedRoute";

const Dashboard = () => {
  const { t } = useValidatedTranslation();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  return (
    <ProtectedRoute>
      <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              {t("dashboard.welcomeTitle")}
              {user?.firstName ? `, ${user.firstName}` : ""}!
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              {t("dashboard.welcomeMessage")}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  {t("dashboard.createCharacters")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t("dashboard.createCharactersDesc")}
                </p>
                <button
                  className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700"
                  onClick={() => navigate("/characters/create")}
                >
                  {t("dashboard.getStarted")}
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  {t("dashboard.generateStories")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t("dashboard.generateStoriesDesc")}
                </p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  {t("dashboard.createStory")}
                </button>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-md">
                <h3 className="text-xl font-semibold mb-4">
                  {t("dashboard.viewMyBooks")}
                </h3>
                <p className="text-gray-600 mb-4">
                  {t("dashboard.viewBooksDesc")}
                </p>
                <button className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700">
                  {t("dashboard.viewBooks")}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Dashboard;
