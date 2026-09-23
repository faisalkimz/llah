export function errorHandler(error, req, res, next) {
  // Log full error to console for debugging
  console.error('API Error:', error);
  console.error('Stack:', error.stack);
  
  req.log?.error({ err: error, requestId: req.id }, 'request failed');
  const status = error.status || 500;
  res.status(status).json({ error: { code: error.code || 'INTERNAL_ERROR', message: status >= 500 ? 'Something went wrong.' : error.message, requestId: req.id } });
}
