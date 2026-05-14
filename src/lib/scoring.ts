import type { CollectionEntry } from 'astro:content';

type Quiz = CollectionEntry<'quizzes'>['data'];
type ResultType = Quiz['resultTypes'][number];

export interface UserAnswers {
  [questionId: string]: number; // option index
}

/**
 * Calculate quiz result from user answers.
 * Returns the winning result type, with tiebreaker resolution.
 */
export function calculateResult(
  quiz: Quiz,
  answers: UserAnswers
): ResultType {
  // Initialize score map
  const scores: Record<string, number> = {};
  for (const rt of quiz.resultTypes) {
    scores[rt.key] = 0;
  }

  // Tally scores from all answered questions
  for (const question of quiz.questions) {
    const answerIndex = answers[question.id];
    if (answerIndex === undefined) continue;

    const selectedOption = question.options[answerIndex];
    if (!selectedOption) continue;

    const weight = question.isMeta ? (question.weightBonus ?? 1) : 1;

    for (const [key, points] of Object.entries(selectedOption.scores)) {
      if (scores[key] !== undefined) {
        scores[key] += points * weight;
      }
    }
  }

  // Find max score
  const maxScore = Math.max(...Object.values(scores));

  // Find all keys tied at max
  const tiedKeys = Object.entries(scores)
    .filter(([, score]) => score === maxScore)
    .map(([key]) => key);

  // Resolve ties using tiebreakerOrder
  for (const key of quiz.tiebreakerOrder) {
    if (tiedKeys.includes(key)) {
      const winner = quiz.resultTypes.find(rt => rt.key === key);
      if (winner) return winner;
    }
  }

  // Fallback — return first result type (should never reach here)
  return quiz.resultTypes[0];
}
