import * as membershipRepository from '../modules/organizations/membership-repository.js';

/**
 * RBAC (Role-Based Access Control) middleware
 * Checks if user has required role(s) in the organization specified in the request
 */

/**
 * Require user to be a member of the organization
 * Organization ID should be in req.params.id or req.params.organizationId
 */
export function requireOrgAccess(req, res, next) {
  return async (req, res, next) => {
    try {
      const organizationId = req.params.id || req.params.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID not provided',
        });
      }

      const membership = await membershipRepository.findByUserAndOrg(
        req.user.id,
        organizationId
      );

      if (!membership) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You are not a member of this organization.',
        });
      }

      // Attach membership info to request for use in route handlers
      req.membership = membership;
      req.organizationId = organizationId;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Require user to have specific role(s) in the organization
 * @param {string|string[]} roles - Required role(s)
 * @returns {Function} Express middleware
 * 
 * @example
 * router.delete('/:id', requireRole(['OWNER', 'ADMIN']), deleteOrganization);
 */
export function requireRole(roles) {
  const roleArray = Array.isArray(roles) ? roles : [roles];

  return async (req, res, next) => {
    try {
      const organizationId = req.params.id || req.params.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID not provided',
        });
      }

      const membership = await membershipRepository.findByUserAndOrg(
        req.user.id,
        organizationId
      );

      if (!membership) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You are not a member of this organization.',
        });
      }

      if (!roleArray.includes(membership.role)) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required role: ${roleArray.join(' or ')}`,
        });
      }

      // Attach membership info to request
      req.membership = membership;
      req.organizationId = organizationId;

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Role hierarchy for permission checking
 * Higher roles include permissions of lower roles
 */
const ROLE_HIERARCHY = {
  OWNER: 5,
  ADMIN: 4,
  BILLING: 3,
  DEVELOPER: 2,
  ANALYST: 1,
  VIEWER: 0,
};

/**
 * Check if user's role has sufficient permissions
 * @param {string} userRole - User's current role
 * @param {string} requiredRole - Required minimum role
 * @returns {boolean} True if user has sufficient permissions
 */
export function hasPermission(userRole, requiredRole) {
  const userLevel = ROLE_HIERARCHY[userRole] ?? -1;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
  
  return userLevel >= requiredLevel;
}

/**
 * Require user to have minimum role level in the organization
 * Uses role hierarchy - higher roles automatically have access
 * @param {string} minRole - Minimum required role
 * @returns {Function} Express middleware
 * 
 * @example
 * router.patch('/:id', requireMinRole('ADMIN'), updateOrganization);
 */
export function requireMinRole(minRole) {
  return async (req, res, next) => {
    try {
      const organizationId = req.params.id || req.params.organizationId;
      
      if (!organizationId) {
        return res.status(400).json({
          success: false,
          error: 'Organization ID not provided',
        });
      }

      const membership = await membershipRepository.findByUserAndOrg(
        req.user.id,
        organizationId
      );

      if (!membership) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. You are not a member of this organization.',
        });
      }

      if (!hasPermission(membership.role, minRole)) {
        return res.status(403).json({
          success: false,
          error: `Access denied. Required role: ${minRole} or higher`,
        });
      }

      // Attach membership info to request
      req.membership = membership;
      req.organizationId = organizationId;

      next();
    } catch (error) {
      next(error);
    }
  };
}
