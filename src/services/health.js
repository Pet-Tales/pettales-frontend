import { DEBUG_MODE } from "@/utils/constants";
import http from "@/utils/http";
import logger from "@/utils/logger";

const _API = "/health"; // prefix url for schedule api

// get the server health status
const checkServer = () => {
  return new Promise((resolve, reject) => {
    http
      .get(_API + "") // method: GET
      .then((response) => {
        if (response.status === 200) {
          // if api call has been succeeded
          logger.api("GET", _API, response.status, 0, response.data);
          resolve({
            status: response.status,
            data: response.data,
          });
        } else {
          logger.api("GET", _API, response.status, 0, response.data);
          reject({
            status: response.status,
            data: response.data,
          });
        }
      })
      .catch((error) => {
        // if it has error from server.
        logger.api(
          "GET",
          _API,
          error.response?.status || 0,
          0,
          error.response?.data
        );
        if (!DEBUG_MODE) logger.clear(); // clear the console log in prod mode
        reject(error.response);
      });
  });
};

const HealthService = {
  checkServer,
};

export default HealthService;
