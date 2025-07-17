import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const Error500 = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h1 className="text-6xl font-bold text-gray-900">500</h1>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            {t("errors.serverError")}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {t("errors.serverErrorDescription")}
          </p>
        </div>
        <div className="space-y-4">
          <button
            onClick={() => navigate("/")}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-custom-light-yellow hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
          >
            {t("errors.goHome")}
          </button>
          <button
            onClick={() => window.history.back()}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {t("common.back")}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            {t("common.retry")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Error500;
