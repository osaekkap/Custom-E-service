import { useContext } from 'react';
import { AuthContext } from '../stores/AuthContext.jsx';

/**
 * Role definitions:
 *
 *  ── NKTech internal (no customerId) ──────────────────────────────
 *  SUPER_ADMIN    — ระบบทั้งหมด (full access)
 *  TENANT_ADMIN   — NKTech แอดมิน (full access incl. Declarations & Master Data)
 *  MANAGER        — NKTech ผู้บริหาร (view all + approve billing, read-only forms)
 *  STAFF / USER   — NKTech เจ้าหน้าที่ (handle declarations + NSW)
 *
 *  ── Factory / Customer (scoped by customerId) ────────────────────
 *  CUSTOMER_ADMIN — โรงงาน แอดมิน (manage own company users/billing/shipments)
 *  CUSTOMER       — โรงงาน ลูกค้า (own shipments + billing, read-only)
 *  VIEWER         — Read-only ทุกอย่าง
 */

const NKTECH_ADMIN    = ['SUPER_ADMIN', 'TENANT_ADMIN'];
const NKTECH_INTERNAL = ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER', 'STAFF', 'USER'];
const NKTECH_MANAGER_UP = ['SUPER_ADMIN', 'TENANT_ADMIN', 'MANAGER'];
const CUSTOMER_SIDE   = ['CUSTOMER_ADMIN', 'CUSTOMER'];
const ALL_CAN_CREATE  = [...NKTECH_INTERNAL, 'CUSTOMER_ADMIN', 'CUSTOMER'];

export function usePermissions() {
  const auth = useContext(AuthContext);
  const role = auth?.user?.role || 'VIEWER';

  return {
    role,

    // ─── Shipments ───────────────────────────────────────────────
    canViewShipments:    true,
    canCreateShipment:   ALL_CAN_CREATE.includes(role),
    /** Internal NKTech → see all customers; Factory → own company only */
    canViewAllShipments: NKTECH_INTERNAL.includes(role),

    // ─── Declarations (NKTech internal only) ─────────────────────
    canViewDeclarations: NKTECH_INTERNAL.includes(role),
    canEditDeclarations: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF', 'USER'].includes(role),

    // ─── NSW Tracking ────────────────────────────────────────────
    canViewNsw:    true,
    canViewAllNsw: NKTECH_INTERNAL.includes(role),

    // ─── Master Data (NKTech internal only) ──────────────────────
    canViewMasterData: NKTECH_INTERNAL.includes(role),
    canEditMasterData: ['SUPER_ADMIN', 'TENANT_ADMIN', 'STAFF', 'USER'].includes(role),

    // ─── Billing ─────────────────────────────────────────────────
    canViewBilling: [...NKTECH_MANAGER_UP, 'CUSTOMER_ADMIN', 'CUSTOMER'].includes(role),
    /** CUSTOMER_ADMIN + NKTech manager+ can approve/manage invoices */
    canApproveBilling: [...NKTECH_MANAGER_UP, 'CUSTOMER_ADMIN'].includes(role),
    canViewAllBilling: NKTECH_MANAGER_UP.includes(role),

    // ─── Reports ─────────────────────────────────────────────────
    canViewReports:    true,
    canViewAllReports: NKTECH_INTERNAL.includes(role),

    // ─── Settings ────────────────────────────────────────────────
    canViewSettings:      [...NKTECH_MANAGER_UP, 'CUSTOMER_ADMIN'].includes(role),
    /** CUSTOMER_ADMIN can manage users within their own company */
    canManageUsers:       [...NKTECH_ADMIN, 'CUSTOMER_ADMIN'].includes(role),
    canEditCompanySettings: [...NKTECH_ADMIN, 'CUSTOMER_ADMIN'].includes(role),
    canViewCompanySettings: [...NKTECH_MANAGER_UP, 'CUSTOMER_ADMIN'].includes(role),
    /** Security tab — NKTech admins see all audit logs; CUSTOMER_ADMIN sees their own company */
    canViewSecurity:      [...NKTECH_ADMIN, 'CUSTOMER_ADMIN'].includes(role),

    // ─── Super Admin Console ─────────────────────────────────────
    canViewSuperAdmin: role === 'SUPER_ADMIN',

    // ─── Job Assignment (B1) ────────────────────────────────────────
    canAssignJobs: NKTECH_INTERNAL.includes(role),

    // ─── Approval Workflow (B2) ───────────────────────────────────
    canApproveJobs:   NKTECH_MANAGER_UP.includes(role),
    canRequestApproval: [...NKTECH_INTERNAL, 'CUSTOMER_ADMIN'].includes(role),

    // ─── Convenience flags ───────────────────────────────────────
    isSuperAdmin:    role === 'SUPER_ADMIN',
    isAdmin:         NKTECH_ADMIN.includes(role),
    isManager:       role === 'MANAGER',
    isStaff:         role === 'STAFF' || role === 'USER',
    isCustomerAdmin: role === 'CUSTOMER_ADMIN',
    isCustomer:      role === 'CUSTOMER',
    isViewer:        role === 'VIEWER',
    isInternalUser:  NKTECH_INTERNAL.includes(role),
    isFactoryUser:   CUSTOMER_SIDE.includes(role),

    isReadOnly: (screen) => {
      if ([...NKTECH_ADMIN, 'CUSTOMER_ADMIN'].includes(role)) return false;
      if (role === 'MANAGER') {
        return ['declarations', 'master', 'shipments', 'nsw', 'settings'].includes(screen);
      }
      if (role === 'VIEWER') return true;
      return false;
    },
  };
}
