// Multi-tenant scope middleware
// Ensures all queries are scoped to the authenticated user's organization
const tenantScope = (req, res, next) => {
  if (!req.user || !req.organizationId) {
    return res.status(401).json({ message: 'Tenant context not available.' });
  }

  // Attach organizationId to query helpers
  req.tenantFilter = { organizationId: req.organizationId };

  next();
};

module.exports = tenantScope;
