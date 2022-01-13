// a wrapper for middleware to catch errors

function catchError(handler) {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};

module.exports = { catchError };