import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { Typography, Card, CardBody } from "@material-tailwind/react";

const PrivacyPolicy = () => {
  const { t } = useValidatedTranslation();

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Typography
            variant="h1"
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            {t("legal.privacy.title")}
          </Typography>
          <Typography variant="lead" className="text-xl text-gray-600">
            {t("legal.privacy.subtitle")}
          </Typography>
          <Typography className="text-gray-500 mt-4">
            {t("legal.privacy.lastUpdated")}:{" "}
            {t("legal.privacy.lastUpdatedDate")}
          </Typography>
        </div>

        {/* Content */}
        <Card className="mb-8">
          <CardBody className="p-8">
            {/* Introduction */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.privacy.introduction.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.privacy.introduction.content1")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.privacy.introduction.content2")}
              </Typography>
            </section>

            {/* Information We Collect */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.privacy.informationCollected.title")}
              </Typography>

              <div className="mb-6">
                <Typography
                  variant="h4"
                  className="text-xl font-medium text-gray-800 mb-3"
                >
                  {t("legal.privacy.informationCollected.personal.title")}
                </Typography>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    {t("legal.privacy.informationCollected.personal.item1")}
                  </li>
                  <li>
                    {t("legal.privacy.informationCollected.personal.item2")}
                  </li>
                  <li>
                    {t("legal.privacy.informationCollected.personal.item3")}
                  </li>
                  <li>
                    {t("legal.privacy.informationCollected.personal.item4")}
                  </li>
                </ul>
              </div>

              <div className="mb-6">
                <Typography
                  variant="h4"
                  className="text-xl font-medium text-gray-800 mb-3"
                >
                  {t("legal.privacy.informationCollected.usage.title")}
                </Typography>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>{t("legal.privacy.informationCollected.usage.item1")}</li>
                  <li>{t("legal.privacy.informationCollected.usage.item2")}</li>
                  <li>{t("legal.privacy.informationCollected.usage.item3")}</li>
                </ul>
              </div>

              <div className="mb-6">
                <Typography
                  variant="h4"
                  className="text-xl font-medium text-gray-800 mb-3"
                >
                  {t("legal.privacy.informationCollected.technical.title")}
                </Typography>
                <ul className="list-disc list-inside text-gray-700 space-y-2">
                  <li>
                    {t("legal.privacy.informationCollected.technical.item1")}
                  </li>
                  <li>
                    {t("legal.privacy.informationCollected.technical.item2")}
                  </li>
                  <li>
                    {t("legal.privacy.informationCollected.technical.item3")}
                  </li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.privacy.howWeUse.title")}
              </Typography>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t("legal.privacy.howWeUse.item1")}</li>
                <li>{t("legal.privacy.howWeUse.item2")}</li>
                <li>{t("legal.privacy.howWeUse.item3")}</li>
                <li>{t("legal.privacy.howWeUse.item4")}</li>
                <li>{t("legal.privacy.howWeUse.item5")}</li>
                <li>{t("legal.privacy.howWeUse.item6")}</li>
              </ul>
            </section>

            {/* Information Sharing */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.privacy.informationSharing.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.privacy.informationSharing.content1")}
              </Typography>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t("legal.privacy.informationSharing.item1")}</li>
                <li>{t("legal.privacy.informationSharing.item2")}</li>
                <li>{t("legal.privacy.informationSharing.item3")}</li>
                <li>{t("legal.privacy.informationSharing.item4")}</li>
              </ul>
            </section>

            {/* Data Security */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.privacy.dataSecurity.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.privacy.dataSecurity.content1")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.privacy.dataSecurity.content2")}
              </Typography>
            </section>

            {/* Your Rights */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.privacy.yourRights.title")}
              </Typography>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t("legal.privacy.yourRights.item1")}</li>
                <li>{t("legal.privacy.yourRights.item2")}</li>
                <li>{t("legal.privacy.yourRights.item3")}</li>
                <li>{t("legal.privacy.yourRights.item4")}</li>
                <li>{t("legal.privacy.yourRights.item5")}</li>
              </ul>
            </section>

            {/* Cookies */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.privacy.cookies.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.privacy.cookies.content1")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.privacy.cookies.content2")}
              </Typography>
            </section>

            {/* Children's Privacy */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.privacy.childrensPrivacy.title")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.privacy.childrensPrivacy.content")}
              </Typography>
            </section>

            {/* Changes to Policy */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.privacy.changes.title")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.privacy.changes.content")}
              </Typography>
            </section>

            {/* Contact Information */}
            <section>
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.privacy.contact.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.privacy.contact.content")}
              </Typography>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Typography className="font-medium text-gray-900">
                  {t("legal.privacy.contact.email")}: support@pettales.ai
                </Typography>
              </div>
            </section>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
