/**
 * claimRouter.js
 *
 * Determines the best claim pathway for a user based on document data.
 * Phase 1: Rule-based logic.
 * Phase 2: Will be replaced/augmented with AI analysis.
 */

const CLAIM_TYPES = {
  FAST_TRACK:       'Fast Track Claim',
  LEGAL_ASSISTANCE: 'Legal Assistance Required',
  NOMINATION_CLAIM: 'Nomination-Based Claim',
  SUCCESSION_CERT:  'Succession Certificate Required',
};

const CLAIM_THRESHOLDS = {
  FAST_TRACK_MAX_AMOUNT: 500000, // ₹5,00,000
};

/**
 * Routes a claim to the appropriate process based on extracted document data.
 *
 * @param {Object} claimData - Extracted document data (from documentExtractor).
 * @returns {Object} - Routing result with claim type, steps, and recommendations.
 */
function routeClaim(claimData) {
  const {
    amount       = 0,
    nomineeName  = '',
    policyType   = '',
    deceasedName = '',
  } = claimData;

  const hasNominee     = nomineeName.trim().length > 0;
  const isBelowThresh  = amount < CLAIM_THRESHOLDS.FAST_TRACK_MAX_AMOUNT;
  const isInsurance    = ['LIC', 'insurance', 'policy'].some(k =>
    policyType.toLowerCase().includes(k)
  );

  // ─── Rule engine ───────────────────────────────────────────────────────────
  let claimType, estimatedDays, steps, notes;

  if (hasNominee && isBelowThresh) {
    claimType     = CLAIM_TYPES.FAST_TRACK;
    estimatedDays = '15–30 business days';
    steps = [
      'Gather: Death certificate, nominee ID proof, bank passbook',
      'Submit claim form to the bank/institution',
      'Bank verifies nominee identity',
      'Amount released to nominee account',
    ];
    notes = 'Nominee exists and amount qualifies for fast-track processing.';

  } else if (hasNominee && isInsurance) {
    claimType     = CLAIM_TYPES.NOMINATION_CLAIM;
    estimatedDays = '30–60 business days';
    steps = [
      'Collect: Policy document, death certificate, nominee ID',
      "Fill insurance company's claim form (Form 3784)",
      'Submit to nearest branch with attested documents',
      'Surveyor visit may be required for large amounts',
      'Cheque/NEFT transfer to nominee',
    ];
    notes = 'Insurance nomination claim — nominee entitled to full sum assured.';

  } else {
    claimType     = CLAIM_TYPES.LEGAL_ASSISTANCE;
    estimatedDays = '3–6 months';
    steps = [
      'Obtain Legal Heir Certificate from Tehsildar/Revenue office',
      'Apply for Succession Certificate from Civil Court if required',
      'All legal heirs must sign NOC (No Objection Certificate)',
      'Submit court order to bank/institution',
      'Funds released proportionally per succession order',
    ];
    notes = amount >= CLAIM_THRESHOLDS.FAST_TRACK_MAX_AMOUNT
      ? 'Large amount requires legal heir documentation and possible court order.'
      : 'No nominee on record — legal heir process required.';
  }

  return {
    claimType,
    estimatedDays,
    steps,
    notes,
    deceasedName,
    amount,
    hasNominee,
    routedAt: new Date().toISOString(),
  };
}

module.exports = { routeClaim, CLAIM_TYPES, CLAIM_THRESHOLDS };
