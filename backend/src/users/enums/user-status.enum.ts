/**
 * Estados posibles de una cuenta de usuario.
 */
export enum UserStatus {
  PENDING_EMAIL_VERIFICATION = 'pending_email_verification',
  PENDING_APPROVAL = 'pending_approval',
  ACTIVE = 'active',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
}
