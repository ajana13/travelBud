import type { PersonaSnapshot } from "./persona-snapshot-store.ts";

interface PlainLanguageProjection {
  id: string;
  category: string;
  statement: string;
  confidence: string;
  editable: boolean;
}

const PROJECTION_THRESHOLD = 0.3;

function confidenceLevel(score: number): string {
  if (score >= 0.8) return "high";
  if (score >= 0.5) return "medium";
  return "low";
}

const NEGATIVE_THRESHOLD = -0.3;

export function generateProjections(
  snap: PersonaSnapshot
): PlainLanguageProjection[] {
  const projections: PlainLanguageProjection[] = [];

  for (const [tag, score] of Object.entries(snap.preferences.tags)) {
    if (score >= PROJECTION_THRESHOLD) {
      projections.push({
        id: `proj-${tag}`,
        category: tag,
        statement: `Interested in ${tag}`,
        confidence: confidenceLevel(score),
        editable: true,
      });
    } else if (score <= NEGATIVE_THRESHOLD) {
      projections.push({
        id: `proj-${tag}`,
        category: tag,
        statement: `Tends to avoid ${tag}`,
        confidence: confidenceLevel(Math.abs(score)),
        editable: true,
      });
    }
  }

  return projections;
}
