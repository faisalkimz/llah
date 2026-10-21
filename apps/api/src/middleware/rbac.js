import * as membershipRepository from '../modules/organizations/membership-repository.js';
import prisma from '../lib/prisma.js';
import { env } from '../config/env.js';

/**
 * Resolve the set of platform super-admin emails from the SUPER_ADMIN_EMAILS env var.
 * Returns a Set<string> of lowercased emails.
 */
function getSuperAdminEmails() {
  if (!env.SUPER_ADMIN_EMAILS) return new Set();
  return new Set(
    env.SUPER_ADMIN_EMAILS.split(',').map(e => e.trim().toLowerCase()).filter(Boolean)
  );
}

/**
 * RBAC (Role-Based Access Control) middleware
 * Checks if user has required role(s) in the organization specified in the request
 */

/**
 * Require user to be a member of the organization
 * Organization ID should be in req.params.id or req.params.organizationId
 */
export async function requireOrgAccess(req, res, next) {
  try {
    const organizationId = req.params.id || req.params.organizationId || req.organizationId;

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
      const organizationId = req.params.id || req.params.organizationId || req.organizationId;
      
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
 * Require the caller to be a platform-level super-admin.
 *
 * Super-admin status is determined by the SUPER_ADMIN_EMAILS env var (comma-separated).
 * This is intentionally NOT derived from org membership roles -- being an OWNER or ADMIN
 * of your own organization must NOT grant access to other orgs' data.
 *
 * In development (NODE_ENV !== 'production') and when SUPER_ADMIN_EMAILS is not set,
 * the check is skipped so developers can test the admin panel without configuration.
 * In production, SUPER_ADMIN_EMAILS MUST be set or all requests return 403.
 */
export async function requireAdminAnywhere(req, res, next) {
  try {
    const superAdminEmails = getSuperAdminEmails();

    // Production hard-fail if no super-admin list is configured
    if (env.NODE_ENV === 'production' && superAdminEmails.size === 0) {
      return res.status(403).json({
        error: {
          code: 'SUPER_ADMIN_NOT_CONFIGURED',
          message: 'Platform admin access is not configured. Set SUPER_ADMIN_EMAILS.',
        },
      });
    }

    // Dev/test bypass: allow if SUPER_ADMIN_EMAILS is not set
    if (superAdminEmails.size === 0) {
      req.isSuperAdmin = true;
      return next();
    }

    // Fetch the user's email from DB to verify (can't trust JWT alone for privilege escalation)
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true },
    });

    if (!user || !superAdminEmails.has(user.email.toLowerCase())) {
      return res.status(403).json({
        error: {
          code: 'SUPER_ADMIN_REQUIRED',
          message: 'This action requires platform super-admin access.',
        },
      });
    }

    req.isSuperAdmin = true;
    next();
  } catch (error) {
    next(error);
  }
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
      const organizationId = req.params.id || req.params.organizationId || req.organizationId;
      
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
