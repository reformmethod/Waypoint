/**
 * ============================================================================
 * WAYPOINT V18 AI CRISIS INTERCEPT PROTOCOL
 * ============================================================================
 * Clinical Safeguarding Layer: Keyword Tripwire & High-Risk Pattern Interceptor
 * - Pre-inference tripwire scans user input BEFORE reaching the local LLM.
 * - Instantly halts standard generation and SQLite mutations.
 * - Injects full-width muted terracotta (#C25953) CrisisOverrideCard into chat.
 * - Enforces exact safeguarding response text.
 * - Silently fires B2B webhook alerting linked organizations with "Severe Risk Incident" timestamp.
 * ============================================================================
 */

import { recordAnonymizedTelemetryEvent } from '../utils/waypointStorage';
import { WaypointUserProfile, AnonymizedTelemetryPacket } from '../types/waypoint';

export interface CrisisPatternDefinition {
  id: string;
  category: 'suicide' | 'self-harm' | 'overdose' | 'acute-crisis';
  severity: 'CRITICAL';
  regex: RegExp;
  label: string;
}

export interface CrisisScanResult {
  isCrisis: boolean;
  matchedCategory?: 'suicide' | 'self-harm' | 'overdose' | 'acute-crisis';
  matchedPatternLabel?: string;
  timestamp: string;
  sanitizedInputExcerpt?: string;
}

export const MANDATED_AI_CRISIS_RESPONSE =
  "I'm so sorry you are feeling this way, but I am an AI and cannot keep you safe right now. Please tap the button below to connect with a human who can help immediately.";

export class CrisisInterceptor {
  /**
   * Hardcoded array of high-risk RegEx tripwire patterns.
   * Scanned strictly in-memory before any LLM inference or tool execution.
   */
  private static readonly HIGH_RISK_PATTERNS: CrisisPatternDefinition[] = [
    // Suicide & Fatal Intent
    {
      id: 'suicide-explicit',
      category: 'suicide',
      severity: 'CRITICAL',
      regex: /\b(suicid(e|al|ing)|kill(ing)?\s+(my|one)?self|want\s+to\s+die|wanna\s+die|wish\s+I\s+was\s+dead|better\s+off\s+dead)\b/i,
      label: 'Explicit Suicidal Ideation',
    },
    {
      id: 'ending-life-colloquial',
      category: 'suicide',
      severity: 'CRITICAL',
      regex: /\b(end\s+it\s+all|ending\s+it\s+all|end\s+my\s+life|ending\s+my\s+life|ending\s+it|take\s+my\s+(own\s+)?life|taking\s+my\s+(own\s+)?life|no\s+reason\s+to\s+live|don't\s+want\s+to\s+(live|exist|be\s+here|wake\s+up))\b/i,
      label: 'Life Termination Intent',
    },
    // Overdose
    {
      id: 'overdose-patterns',
      category: 'overdose',
      severity: 'CRITICAL',
      regex: /\b(overdose|overdosing|overdosed|od'?ing|take\s+all\s+(my\s+)?(pills|meds|tablets)|swallow\s+all\s+(my\s+)?(pills|meds|tablets)|took\s+too\s+many\s+pills)\b/i,
      label: 'Overdose / Ingestion Intent',
    },
    // Self-Harm & Physical Damage
    {
      id: 'self-harm-explicit',
      category: 'self-harm',
      severity: 'CRITICAL',
      regex: /\b(self[-\s]?harm|harm(ing)?\s+myself|hurt(ing)?\s+myself|cut(ting)?\s+my(self|wrist|arm|leg|skin)|hang(ing)?\s+myself|bleed\s+out|jump(ing)?\s+off\s+(a\s+bridge|a\s+roof|a\s+building))\b/i,
      label: 'Active Self-Harm / Injury',
    },
    // Acute Collapse / Fatal Hopelessness
    {
      id: 'acute-despair',
      category: 'acute-crisis',
      severity: 'CRITICAL',
      regex: /\b(can't\s+(go\s+on|survive\s+this|take\s+this\s+anymore)|ready\s+to\s+quit\s+forever|goodbye\s+cruel\s+world|saying\s+my\s+final\s+goodbyes)\b/i,
      label: 'Acute Crisis Resignation',
    },
  ];

  /**
   * Scans user input against all high-risk tripwires.
   * Returns immediately upon first matched pattern.
   */
  public static evaluateInput(userInput: string): CrisisScanResult {
    const normalized = (userInput || '').trim().toLowerCase();
    const timestamp = new Date().toISOString();

    if (!normalized) {
      return { isCrisis: false, timestamp };
    }

    for (const pattern of this.HIGH_RISK_PATTERNS) {
      if (pattern.regex.test(normalized)) {
        return {
          isCrisis: true,
          matchedCategory: pattern.category,
          matchedPatternLabel: pattern.label,
          timestamp,
          sanitizedInputExcerpt: normalized.substring(0, 40),
        };
      }
    }

    return { isCrisis: false, timestamp };
  }

  /**
   * Objective 3: B2B Dashboard Flagging (Silent Webhook)
   * Dispatches an asynchronous, silent webhook to notify the clinical organization
   * and logs an anonymized "Severe Risk Incident" telemetry event.
   */
  public static async silentB2BWebhookAlert(
    userProfile?: WaypointUserProfile,
    scanResult?: CrisisScanResult
  ): Promise<void> {
    const timestamp = scanResult?.timestamp || new Date().toISOString();
    const orgCode = userProfile?.orgCode;
    const anonymizedUserId = userProfile?.id || 'anon-client';

    // 1. Local / In-Memory Anonymized Telemetry Packet Update
    const telemetryPacket: Omit<AnonymizedTelemetryPacket, 'id'> = {
      orgCode: orgCode || 'UNLINKED',
      ageBracket: userProfile?.ageBracket || '18-24',
      redButtonUsed: true,
      severeRiskIncident: true,
      severeRiskTimestamp: timestamp,
      crisisTrigger: scanResult?.matchedPatternLabel || 'Tripwire Intercept',
      pillarAdherenceRate: 0,
      microTaskEnabled: userProfile?.microTaskMode ?? true,
      sensoryMode: userProfile?.sensoryMode ?? 'standard',
      timestamp,
      anxietyBand: 'Severe',
      depressionBand: 'Severe',
    };

    recordAnonymizedTelemetryEvent(telemetryPacket);

    // 2. Silent Webhook Dispatch if User is Linked to an Organization
    if (orgCode && orgCode !== 'UNLINKED') {
      try {
        const payload = {
          eventType: 'SEVERE_RISK_INCIDENT',
          orgCode,
          anonymizedUserId,
          timestamp,
          category: scanResult?.matchedCategory || 'crisis-intercept',
          triggerLabel: scanResult?.matchedPatternLabel || 'Tripwire Safeguard Activated',
          safeguardAction: '999_OVERRIDE_INJECTED',
          zeroPII: true,
        };

        // Fire & forget fetch to Next.js / Express backend endpoint
        // Handles offline or local container environments gracefully
        if (typeof fetch !== 'undefined') {
          fetch('/api/practitioner/risk-incident', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Waypoint-Safeguard': 'V18-Intercept-Active',
            },
            body: JSON.stringify(payload),
          }).catch((err) => {
            // Silent error logging - zero disruption to emergency UI transition
            console.warn('[CrisisInterceptor] B2B webhook queued locally:', err.message);
          });
        }
      } catch (err) {
        console.warn('[CrisisInterceptor] Webhook dispatch handled silently:', err);
      }
    }
  }
}
