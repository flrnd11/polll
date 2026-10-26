/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { LikertConfig, LikertScaleType } from '../types/survey';

export const LIKERT_TEMPLATES: Record<LikertScaleType, LikertConfig> = {
  agreement_5: {
    type: 'agreement_5',
    points: 5,
    labels: [
      'Strongly Disagree',
      'Disagree',
      'Neutral',
      'Agree',
      'Strongly Agree',
    ],
    anchors: {
      low: 'Strongly Disagree (1)',
      high: 'Strongly Agree (5)',
    },
  },
  agreement_7: {
    type: 'agreement_7',
    points: 7,
    labels: [
      'Strongly Disagree',
      'Disagree',
      'Somewhat Disagree',
      'Neutral',
      'Somewhat Agree',
      'Agree',
      'Strongly Agree',
    ],
    anchors: {
      low: 'Strongly Disagree (1)',
      high: 'Strongly Agree (7)',
    },
  },
  satisfaction_5: {
    type: 'satisfaction_5',
    points: 5,
    labels: [
      'Very Dissatisfied',
      'Dissatisfied',
      'Neutral',
      'Satisfied',
      'Very Satisfied',
    ],
    anchors: {
      low: 'Very Dissatisfied (1)',
      high: 'Very Satisfied (5)',
    },
  },
  frequency_5: {
    type: 'frequency_5',
    points: 5,
    labels: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
    anchors: {
      low: 'Never (1)',
      high: 'Always (5)',
    },
  },
  importance_5: {
    type: 'importance_5',
    points: 5,
    labels: [
      'Not at all Important',
      'Slightly Important',
      'Moderately Important',
      'Very Important',
      'Extremely Important',
    ],
    anchors: {
      low: 'Not Important (1)',
      high: 'Extremely Important (5)',
    },
  },
  custom: {
    type: 'custom',
    points: 5,
    labels: ['Level 1', 'Level 2', 'Level 3', 'Level 4', 'Level 5'],
    anchors: {
      low: 'Minimum (1)',
      high: 'Maximum (5)',
    },
  },
};

/**
 * Calculates mean, standard deviation, and top-2 box percentage for Likert responses
 */
export function calculateLikertStats(values: number[], maxPoints = 5) {
  if (!values || values.length === 0) {
    return {
      count: 0,
      mean: 0,
      stdDev: 0,
      topTwoBoxPercent: 0,
      distribution: Array(maxPoints).fill(0),
    };
  }

  const count = values.length;
  const sum = values.reduce((acc, val) => acc + val, 0);
  const mean = sum / count;

  // Variance & StdDev
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  const variance = squaredDiffs.reduce((acc, val) => acc + val, 0) / (count > 1 ? count - 1 : 1);
  const stdDev = Math.sqrt(variance);

  // Distribution
  const distribution = Array(maxPoints).fill(0);
  values.forEach((v) => {
    const idx = Math.min(Math.max(1, Math.round(v)), maxPoints) - 1;
    distribution[idx]++;
  });

  // Top 2 Box (scores maxPoints and maxPoints - 1)
  const topTwoCount = values.filter((v) => v >= maxPoints - 1).length;
  const topTwoBoxPercent = Math.round((topTwoCount / count) * 100);

  return {
    count,
    mean: Number(mean.toFixed(2)),
    stdDev: Number(stdDev.toFixed(2)),
    topTwoBoxPercent,
    distribution,
  };
}
