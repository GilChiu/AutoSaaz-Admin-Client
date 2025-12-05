/**
 * Production-safe logging utility
 * Only logs in development mode, suppresses in production
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  log: (...args) => {
    if (isDevelopment) {

    }
  },

  error: (...args) => {
    if (isDevelopment) {

    }
    // In production, you might want to send errors to a monitoring service
    // Example: Sentry.captureException(args[0]);
  },

  warn: (...args) => {
    if (isDevelopment) {

    }
  },

  info: (...args) => {
    if (isDevelopment) {

    }
  },

  debug: (...args) => {
    if (isDevelopment) {

    }
  },
};

export default logger;
