// Temporary simple logger to bypass any external logging issues
const debug = (component, context, message) => console.log(`[DEBUG] [${component}] [${context}] ${message}`);
const info = (component, context, message) => console.log(`[INFO] [${component}] [${context}] ${message}`);
const warn = (component, context, message) => console.warn(`[WARN] [${component}] [${context}] ${message}`);
const error = (component, context, message) => console.error(`[ERROR] [${component}] [${context}] ${message}`);
const fatal = (component, context, message) => console.error(`[FATAL] [${component}] [${context}] ${message}`);

const Log = (stack, level, packageName, message) => {
  console.log(`[${level.toUpperCase()}] [${stack}] [${packageName}] ${message}`);
  return Promise.resolve(true);
};

module.exports = {
  Log,
  debug,
  info,
  warn,
  error,
  fatal
};
