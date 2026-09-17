/**
 * Onboarding is three steps (personal details → KYC documents → bank details)
 * followed by an admin approval. Auth and registration both report progress,
 * so the shape and the step resolution live here.
 */

/** KYC documents an agent must upload before admin approval. */
export const REQUIRED_DOCUMENT_TYPES = ['AADHAAR', 'PAN'] as const;

export type RegistrationStep =
  | 'personal-details'
  | 'documents'
  | 'bank-details'
  | 'awaiting-approval'
  | 'done';

export interface RegistrationSteps {
  personalDetails: boolean;
  documents: boolean;
  bankDetails: boolean;
}

export function isRegistrationComplete(steps: RegistrationSteps) {
  return steps.personalDetails && steps.documents && steps.bankDetails;
}

export function resolveNextStep(
  steps: RegistrationSteps,
  approvalStatus: string,
): RegistrationStep {
  if (!steps.personalDetails) return 'personal-details';
  if (!steps.documents) return 'documents';
  if (!steps.bankDetails) return 'bank-details';
  return approvalStatus === 'APPROVED' ? 'done' : 'awaiting-approval';
}

/** The steps the agent still has to finish, for a checklist screen. */
export function missingSteps(steps: RegistrationSteps) {
  const missing: string[] = [];
  if (!steps.personalDetails) missing.push('personalDetails');
  if (!steps.documents) missing.push('documents');
  if (!steps.bankDetails) missing.push('bankDetails');
  return missing;
}
