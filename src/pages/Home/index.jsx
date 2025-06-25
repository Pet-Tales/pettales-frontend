import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";

import HealthService from "@/services/health";

import { setIsConnectedServer } from "@/stores/reducers/health";

const Home = () => {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { isConnectedServer } = useSelector((state) => state.health);

  const [serverContent, setServerContent] = useState("");

  const checkServer = async () => {
    // check if server is up
    let res = await HealthService.checkServer();
    dispatch(setIsConnectedServer(res.status === 200));
    setServerContent(res.data);
  };

  useEffect(() => {
    checkServer();
  }, []);
  return (
    <p className="h-[100vh]">
      {t("home.title")} - "{serverContent}"
    </p>
  );
};

export default Home;
