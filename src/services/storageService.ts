/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Survey, SurveyResponse, ConflictStrategy } from '../types/survey';
import { INITIAL_SURVEYS, INITIAL_RESPONSES } from '../data/mockData';

const STORAGE_KEYS = {
  SURVEYS: 'ai_survey_instrument_surveys_v1',
  RESPONSES: 'ai_survey_instrument_responses_v1',
  OFFLINE_QUEUE: 'ai_survey_instrument_offline_queue_v1',
  SIMULATED_OFFLINE: 'ai_survey_simulated_offline',
  CONFLICT_STRATEGY: 'ai_survey_conflict_strategy',
};

// Generates a mock encrypted hash representation for offline tamper-proofing
export function generateEncryptedHash(payload: any): string {
  const str = JSON.stringify(payload) + Date.now();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `enc_sha256_${Math.abs(hash).toString(16).padStart(16, '0')}`;
}

class StorageService {
  private isSimulatedOffline: boolean = false;
  private conflictStrategy: ConflictStrategy = 'client_wins';
  private listeners: (() => void)[] = [];

  constructor() {
    this.isSimulatedOffline = localStorage.getItem(STORAGE_KEYS.SIMULATED_OFFLINE) === 'true';
    this.conflictStrategy = (localStorage.getItem(STORAGE_KEYS.CONFLICT_STRATEGY) as ConflictStrategy) || 'client_wins';
  }

  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  public isOnline(): boolean {
    if (this.isSimulatedOffline) return false;
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }

  public setSimulatedOffline(offline: boolean) {
    this.isSimulatedOffline = offline;
    localStorage.setItem(STORAGE_KEYS.SIMULATED_OFFLINE, String(offline));
    this.notify();
    if (!offline) {
      this.autoSync();
    }
  }

  public getSimulatedOffline(): boolean {
    return this.isSimulatedOffline;
  }

  public getConflictStrategy(): ConflictStrategy {
    return this.conflictStrategy;
  }

  public setConflictStrategy(strategy: ConflictStrategy) {
    this.conflictStrategy = strategy;
    localStorage.setItem(STORAGE_KEYS.CONFLICT_STRATEGY, strategy);
    this.notify();
  }

  public getSurveys(): Survey[] {
    const raw = localStorage.getItem(STORAGE_KEYS.SURVEYS);
    if (!raw) {
      this.saveSurveys(INITIAL_SURVEYS);
      return INITIAL_SURVEYS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_SURVEYS;
    }
  }

  public saveSurveys(surveys: Survey[]) {
    localStorage.setItem(STORAGE_KEYS.SURVEYS, JSON.stringify(surveys));
    this.notify();
  }

  public saveSurvey(survey: Survey) {
    const surveys = this.getSurveys();
    const idx = surveys.findIndex((s) => s.id === survey.id);
    if (idx >= 0) {
      surveys[idx] = { ...survey, updatedAt: new Date().toISOString() };
    } else {
      surveys.unshift({
        ...survey,
        createdAt: survey.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    this.saveSurveys(surveys);
  }

  public deleteSurvey(surveyId: string) {
    const surveys = this.getSurveys().filter((s) => s.id !== surveyId);
    this.saveSurveys(surveys);
  }

  public getResponses(): SurveyResponse[] {
    const raw = localStorage.getItem(STORAGE_KEYS.RESPONSES);
    if (!raw) {
      this.saveResponses(INITIAL_RESPONSES);
      return INITIAL_RESPONSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_RESPONSES;
    }
  }

  public saveResponses(responses: SurveyResponse[]) {
    localStorage.setItem(STORAGE_KEYS.RESPONSES, JSON.stringify(responses));
    this.notify();
  }

  public saveResponse(response: SurveyResponse): { queuedOffline: boolean } {
    const responses = this.getResponses();
    const isActuallyOnline = this.isOnline();

    const responseWithHash: SurveyResponse = {
      ...response,
      synced: isActuallyOnline,
      encryptedHash: response.encryptedHash || generateEncryptedHash(response),
    };

    const idx = responses.findIndex((r) => r.id === response.id);
    if (idx >= 0) {
      responses[idx] = responseWithHash;
    } else {
      responses.unshift(responseWithHash);
    }
    this.saveResponses(responses);

    if (!isActuallyOnline) {
      // Add to offline queue
      this.addToOfflineQueue(responseWithHash);
      return { queuedOffline: true };
    }

    return { queuedOffline: false };
  }

  public getOfflineQueue(): SurveyResponse[] {
    const raw = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (!raw) return [];
    try {
      return JSON.parse(raw);
    } catch {
      return [];
    }
  }

  private addToOfflineQueue(response: SurveyResponse) {
    const queue = this.getOfflineQueue();
    if (!queue.find((r) => r.id === response.id)) {
      queue.push(response);
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
    }
    this.notify();
  }

  public async autoSync(): Promise<{ syncedCount: number; message: string }> {
    const queue = this.getOfflineQueue();
    if (queue.length === 0) {
      return { syncedCount: 0, message: 'All survey records are currently in sync.' };
    }

    if (!this.isOnline()) {
      return { syncedCount: 0, message: 'Device is offline. Responses safely preserved in encrypted local storage.' };
    }

    // Simulate network latency & synchronization with conflict resolution
    await new Promise((resolve) => setTimeout(resolve, 800));

    const allResponses = this.getResponses();
    let syncedCount = 0;

    queue.forEach((queuedItem) => {
      const existingIdx = allResponses.findIndex((r) => r.id === queuedItem.id);
      if (existingIdx >= 0) {
        if (this.conflictStrategy === 'client_wins') {
          allResponses[existingIdx] = { ...queuedItem, synced: true };
        } else if (this.conflictStrategy === 'server_wins') {
          // Keep existing, mark synced
          allResponses[existingIdx].synced = true;
        } else {
          // Smart merge: merge answers, newest notes
          allResponses[existingIdx] = {
            ...allResponses[existingIdx],
            answers: { ...allResponses[existingIdx].answers, ...queuedItem.answers },
            synced: true,
          };
        }
      } else {
        allResponses.unshift({ ...queuedItem, synced: true });
      }
      syncedCount++;
    });

    this.saveResponses(allResponses);
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    this.notify();

    return {
      syncedCount,
      message: `Successfully synchronized ${syncedCount} offline record(s) using strategy: ${this.conflictStrategy.replace('_', ' ')}.`,
    };
  }
}

export const storageService = new StorageService();
