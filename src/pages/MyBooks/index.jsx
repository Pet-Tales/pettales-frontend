import { useTranslation } from "react-i18next";
import ProtectedRoute from "@/components/ProtectedRoute";

const MyBooks = () => {
  const { t } = useTranslation();

  return (
    <ProtectedRoute>
      <div className="min-h-fit py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-8">
              {t("pages.myBooksPage")}
            </h1>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default MyBooks;
