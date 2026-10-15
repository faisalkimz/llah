export function requireOrg(req, res, next) {
  const organizationId = req.headers['x-organization-id'];
  if (!organizationId || typeof organizationId !== 'string' || organizationId.trim() === '') {
    return res.status(400).json({
      error: {
        code: 'MISSING_ORG',
        message: 'x-organization-id header is required',
      },
    });
  }
  req.organizationId = organizationId;
  next();
}
