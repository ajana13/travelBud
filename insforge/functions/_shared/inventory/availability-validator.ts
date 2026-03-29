interface AvailabilityInput {
  start: string;
  end: string | null;
  recurring: boolean;
}

interface ValidationResult {
  valid: boolean;
  reason?: string;
}

export function validateAvailability(avail: AvailabilityInput): ValidationResult {
  if (avail.recurring) {
    return { valid: true };
  }

  const now = Date.now();
  const startTime = new Date(avail.start).getTime();

  if (startTime > now) {
    return { valid: true };
  }

  if (avail.end) {
    const endTime = new Date(avail.end).getTime();
    if (endTime < now) {
      return { valid: false, reason: "Event has ended" };
    }
  }

  return { valid: true };
}
