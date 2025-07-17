import { useValidatedTranslation } from "@/hooks/useValidatedTranslation";
import { Typography, Card, CardBody } from "@material-tailwind/react";

const TermsOfService = () => {
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
            {t("legal.terms.title")}
          </Typography>
          <Typography variant="lead" className="text-xl text-gray-600">
            {t("legal.terms.subtitle")}
          </Typography>
          <Typography className="text-gray-500 mt-4">
            {t("legal.terms.lastUpdated")}: {t("legal.terms.lastUpdatedDate")}
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
                {t("legal.terms.introduction.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.terms.introduction.content1")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.terms.introduction.content2")}
              </Typography>
            </section>

            {/* Acceptance of Terms */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.acceptance.title")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.terms.acceptance.content")}
              </Typography>
            </section>

            {/* Description of Service */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.serviceDescription.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.terms.serviceDescription.content1")}
              </Typography>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t("legal.terms.serviceDescription.item1")}</li>
                <li>{t("legal.terms.serviceDescription.item2")}</li>
                <li>{t("legal.terms.serviceDescription.item3")}</li>
                <li>{t("legal.terms.serviceDescription.item4")}</li>
              </ul>
            </section>

            {/* User Accounts */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.userAccounts.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.terms.userAccounts.content1")}
              </Typography>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t("legal.terms.userAccounts.item1")}</li>
                <li>{t("legal.terms.userAccounts.item2")}</li>
                <li>{t("legal.terms.userAccounts.item3")}</li>
                <li>{t("legal.terms.userAccounts.item4")}</li>
              </ul>
            </section>

            {/* Payment and Credits */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.payment.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.terms.payment.content1")}
              </Typography>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t("legal.terms.payment.item1")}</li>
                <li>{t("legal.terms.payment.item2")}</li>
                <li>{t("legal.terms.payment.item3")}</li>
                <li>{t("legal.terms.payment.item4")}</li>
                <li>{t("legal.terms.payment.item5")}</li>
              </ul>
            </section>

            {/* User Content */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.userContent.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.terms.userContent.content1")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.terms.userContent.content2")}
              </Typography>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t("legal.terms.userContent.item1")}</li>
                <li>{t("legal.terms.userContent.item2")}</li>
                <li>{t("legal.terms.userContent.item3")}</li>
                <li>{t("legal.terms.userContent.item4")}</li>
              </ul>
            </section>

            {/* Prohibited Uses */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.prohibitedUses.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.terms.prohibitedUses.content")}
              </Typography>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>{t("legal.terms.prohibitedUses.item1")}</li>
                <li>{t("legal.terms.prohibitedUses.item2")}</li>
                <li>{t("legal.terms.prohibitedUses.item3")}</li>
                <li>{t("legal.terms.prohibitedUses.item4")}</li>
                <li>{t("legal.terms.prohibitedUses.item5")}</li>
                <li>{t("legal.terms.prohibitedUses.item6")}</li>
              </ul>
            </section>

            {/* Intellectual Property */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.intellectualProperty.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.terms.intellectualProperty.content1")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.terms.intellectualProperty.content2")}
              </Typography>
            </section>

            {/* Disclaimers */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.disclaimers.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.terms.disclaimers.content1")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.terms.disclaimers.content2")}
              </Typography>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.limitationOfLiability.title")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.terms.limitationOfLiability.content")}
              </Typography>
            </section>

            {/* Termination */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.termination.title")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.terms.termination.content")}
              </Typography>
            </section>

            {/* Changes to Terms */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.changes.title")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.terms.changes.content")}
              </Typography>
            </section>

            {/* Governing Law */}
            <section className="mb-8">
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.governingLaw.title")}
              </Typography>
              <Typography className="text-gray-700">
                {t("legal.terms.governingLaw.content")}
              </Typography>
            </section>

            {/* Contact Information */}
            <section>
              <Typography
                variant="h3"
                className="text-2xl font-semibold text-gray-900 mb-4"
              >
                {t("legal.terms.contact.title")}
              </Typography>
              <Typography className="text-gray-700 mb-4">
                {t("legal.terms.contact.content")}
              </Typography>
              <div className="bg-gray-50 p-4 rounded-lg">
                <Typography className="font-medium text-gray-900">
                  {t("legal.terms.contact.email")}: support@pettales.ai
                </Typography>
              </div>
            </section>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
