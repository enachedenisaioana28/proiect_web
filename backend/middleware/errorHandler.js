'use strict';

function errorHandler(err, req, res, next) {
  console.error(`\x1b[31m[EROARE]\x1b[0m ${err.message}`);
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }
  const status = err.status || 500;
  res.status(status).json({
    success: false,
    error  : err.message || 'Eroare internă de server.',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}
module.exports = errorHandler;