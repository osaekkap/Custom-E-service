import { useContext } from 'react';
import { AuthContext } from '../stores/AuthContext.jsx';

/**
 * Role definitions:
 *  SUPER_ADMIN  — NKTech system admin (full access to everything)
 *  TENANT_ADMIN — แอดมิน: full access within tenant + user management
 *  MANAGER      — ผู้บริหาร: view all + approve billing, read-only on forms
 *  STAFF        — เจ้าหน้าที่: handle declarations + NSW, no billing management
 *  CUSTOMER     — ลูกค้า: own shipments/billing only, can create shipments
 *  USER         — Legacy alias → treated same as STAFF
 *  VIEWER       — Read-only everything, no edits
 */

const ADMIN_ROLES     = ['SUPER_ADMIN', 'TENANT_ADMIN'];
const INTERNAL_ROLES  = ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF', 'USER'];
const MANAGER_UP      = ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'];
const STAFF_UP        = ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF', 'USER'];

export function usePermissions() {
  const auth = useContext(AuthContext);
  const role = auth?.user?.role || 'VIEWER';

  return {
    role,

    // ─── Shipments ───────────────────────────────────────────────
    /** Can see the Shipments screen */
    canViewShipments: true, // all roles see shipments (own or all)
    /** Can create a new shipment */
    canCreateShipment: [...STAFF_UP, 'CUSTOMER'].includes(role),
    /** Sees ALL customers' shipments (internal staff) vs only own (customer) */
    canViewAllShipments: INTERNAL_ROLES.includes(role),

    // ─── Declarations ────────────────────────────────────────────
    /** Can see the Declarations screen */
    canViewDeclarations: STAFF_UP.includes(role),
    /** Can create / edit declarations */
    canEditDeclarations: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF', 'USER'].includes(role),

    // ─── NSW Tracking ────────────────────────────────────────────
    canViewNsw: true, // all roles (filtered by own vs all)
    canViewAllNsw: INTERNAL_ROLES.includes(role),

    // ─── Master Data ─────────────────────────────────────────────
    /** Can see Master Data screen */
    canViewMasterData: STAFF_UP.includes(role),
    /** Can edit master data (HS codes, exporters, etc.) */
    canEditMasterData: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF', 'USER'].includes(role),

    // ─── Billing ─────────────────────────────────────────────────
    /** Can see the Billing screen */
    canViewBilling: [...MANAGER_UP, 'CUSTOMER'].includes(role),
    /** Can approve / create invoices */
    canApproveBilling: MANAGER_UP.includes(role),
    /** Sees all customers' billing (internal) vs own only (customer) */
    canViewAllBilling: MANAGER_UP.includes(role),

    // ─── Reports ─────────────────────────────────────────────────
    canViewReports: true, // all roles see reports (own data scope)
    canViewAllReports: INTERNAL_ROLES.includes(role),

    // ─── Settings ────────────────────────────────────────────────
    /** Can open Settings screen at all */
    canViewSettings: MANAGER_UP.includes(role),
    /** Can manage users (invite, remove, change roles) */
    canManageUsers: ADMIN_ROLES.includes(role),
    /** Can edit company settings */
    canEditCompanySettings: ADMIN_ROLES.includes(role),
    /** Read-only on Settings > Company (Manager can view) */
    canViewCompanySettings: MANAGER_UP.includes(role),

    // ─── Super Admin Console ─────────────────────────────────────
    canViewSuperAdmin: role === 'SUPER_ADMIN',

    // ─── Convenience flags ───────────────────────────────────────
    isSuperAdmin:  role === 'SUPER_ADMIN',
    isAdmin:       ADMIN_ROLES.includes(role),
    isManager:     role === 'MANAGER',
    isStaff:       role === 'STAFF' || role === 'USER',
    isCustomer:    role === 'CUSTOMER',
    isViewer:      role === 'VIEWER',
    isInternalUser: INTERNAL_ROLES.includes(role),

    /** Returns true if the user has read-only access to a given screen (can view but not edit) */
    isReadOnly: (screen) => {
      if (ADMIN_ROLES.includes(role)) return false; // admins always full access
      if (role === 'MANAGER') {
        return ['declarations', 'master', 'shipments', 'nsw', 'settings'].includes(screen);
      }
      if (role === 'VIEWER') return true;
      return false;
    },
  };
}
