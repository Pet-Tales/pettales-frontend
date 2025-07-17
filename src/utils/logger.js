import { DEBUG_MODE } from "./constants";

// Store original console methods
const originalConsole = {
  log: console.log,
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
  clear: console.clear,
  group: console.group,
  groupEnd: console.groupEnd,
  table: console.table,
  time: console.time,
  timeEnd: console.timeEnd,
};

// Log levels
const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

// Current log level based on debug mode
const CURRENT_LOG_LEVEL = DEBUG_MODE ? LOG_LEVELS.DEBUG : LOG_LEVELS.ERROR;

// Helper function to format timestamp
const getTimestamp = () => {
  const now = new Date();
  return now.toISOString().replace("T", " ").substring(0, 19);
};

// Helper function to format log message
const formatMessage = (level, message, ...args) => {
  const timestamp = getTimestamp();
  const levelStr = level.toUpperCase();
  const formattedMessage =
    typeof message === "string" ? message : JSON.stringify(message);

  if (args.length > 0) {
    const formattedArgs = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      )
      .join(" ");
    return `[${timestamp}] [${levelStr}] ${formattedMessage} ${formattedArgs}`;
  }

  return `[${timestamp}] [${levelStr}] ${formattedMessage}`;
};

// Enhanced logger object
const logger = {
  // Standard log levels
  error: (message, ...args) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.ERROR) {
      const formatted = formatMessage("ERROR", message, ...args);
      originalConsole.error(formatted);
    }
  },

  warn: (message, ...args) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.WARN) {
      const formatted = formatMessage("WARN", message, ...args);
      originalConsole.warn(formatted);
    }
  },

  info: (message, ...args) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.INFO) {
      const formatted = formatMessage("INFO", message, ...args);
      originalConsole.info(formatted);
    }
  },

  debug: (message, ...args) => {
    if (CURRENT_LOG_LEVEL >= LOG_LEVELS.DEBUG) {
      const formatted = formatMessage("DEBUG", message, ...args);
      originalConsole.debug(formatted);
    }
  },

  // Specialized logging methods
  api: (method, url, status, responseTime, data = {}) => {
    const message = `API: ${method} ${url} - ${status} - ${responseTime}ms`;
    if (status >= 400) {
      logger.error(message, data);
    } else if (status >= 300) {
      logger.warn(message, data);
    } else {
      logger.info(message, data);
    }
  },

  auth: (action, success = true, details = {}) => {
    const message = `AUTH: ${action} - ${success ? "SUCCESS" : "FAILED"}`;
    if (success) {
      logger.info(message, details);
    } else {
      logger.warn(message, details);
    }
  },

  navigation: (from, to, details = {}) => {
    const message = `NAVIGATION: ${from} -> ${to}`;
    logger.debug(message, details);
  },

  component: (componentName, action, details = {}) => {
    const message = `COMPONENT: ${componentName} - ${action}`;
    logger.debug(message, details);
  },

  state: (action, stateName, newValue, oldValue) => {
    const message = `STATE: ${action} - ${stateName}`;
    logger.debug(message, { newValue, oldValue });
  },

  performance: (operation, duration, details = {}) => {
    const message = `PERFORMANCE: ${operation} took ${duration}ms`;
    if (duration > 1000) {
      logger.warn(message, details);
    } else {
      logger.debug(message, details);
    }
  },

  user: (action, details = {}) => {
    const message = `USER: ${action}`;
    logger.info(message, details);
  },

  // Utility methods
  group: (label) => {
    if (DEBUG_MODE) {
      originalConsole.group(label);
    }
  },

  groupEnd: () => {
    if (DEBUG_MODE) {
      originalConsole.groupEnd();
    }
  },

  table: (data) => {
    if (DEBUG_MODE) {
      originalConsole.table(data);
    }
  },

  time: (label) => {
    if (DEBUG_MODE) {
      originalConsole.time(label);
    }
  },

  timeEnd: (label) => {
    if (DEBUG_MODE) {
      originalConsole.timeEnd(label);
    }
  },

  clear: () => {
    if (DEBUG_MODE) {
      originalConsole.clear();
    }
  },

  // Access to original console methods
  originalConsole,

  // Configuration
  isDebugMode: () => DEBUG_MODE,
  getCurrentLogLevel: () => CURRENT_LOG_LEVEL,
};

// Override global console methods in production to suppress output
if (!DEBUG_MODE) {
  // In production, only allow error logs to show
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.debug = () => {};

  // Keep error logging but make it cleaner
  console.error = (...args) => {
    const message = args
      .map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      )
      .join(" ");
    originalConsole.error(`[ERROR] ${message}`);
  };
} else {
  // In debug mode, enhance console methods with timestamps
  console.log = (...args) => {
    const formatted = formatMessage("LOG", ...args);
    originalConsole.log(formatted);
  };

  console.info = (...args) => {
    const formatted = formatMessage("INFO", ...args);
    originalConsole.info(formatted);
  };

  console.warn = (...args) => {
    const formatted = formatMessage("WARN", ...args);
    originalConsole.warn(formatted);
  };

  console.debug = (...args) => {
    const formatted = formatMessage("DEBUG", ...args);
    originalConsole.debug(formatted);
  };

  console.error = (...args) => {
    const formatted = formatMessage("ERROR", ...args);
    originalConsole.error(formatted);
  };
}

// Log system initialization
logger.debug("Frontend logger initialized", {
  debugMode: DEBUG_MODE,
  logLevel: CURRENT_LOG_LEVEL,
});

export default logger;
