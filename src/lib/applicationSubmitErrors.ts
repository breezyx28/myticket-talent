const SUBMIT_FIELD_TO_STEP: Record<string, number> = {
  stage_name: 0,
  contact_email: 0,
  contact_phone: 0,
  bio: 1,
  saudi_region_id: 1,
  city: 1,
  media: 2,
  accepted_quality_disclaimer: 2,
  certificate_name: 2,
};

export function resolveSubmitErrorStep(fieldErrors: Record<string, string[]>): number {
  let step = 3;
  for (const field of Object.keys(fieldErrors)) {
    const mapped = SUBMIT_FIELD_TO_STEP[field];
    if (mapped != null) step = Math.min(step, mapped);
  }
  return step;
}
