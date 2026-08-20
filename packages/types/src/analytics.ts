// packages/types/src/analytics.ts
//
// The event catalogue (Technical Build Spec §24.2). Names are snake_case,
// past tense. An event not in this union cannot be emitted — that is the
// entire point of typing it this way. Add a new event by adding a member
// here first; do not emit an ad-hoc event name from either app.

import type { AnswerType, DifficultyBand, DifficultyMode, PracticeMode } from "./domain";
import type { PracticeScopeKind } from "./api";

export type AnalyticsEvent =
  | { name: "app_opened"; props: { cold: boolean; app_version: string } }
  | { name: "onboarding_started"; props: Record<string, never> }
  | {
      name: "onboarding_sitting_selected";
      props: { year: number; month: "january" | "may_june" };
    }
  | {
      name: "onboarding_completed";
      props: { skipped_interests: boolean; seconds: number };
    }
  | {
      name: "account_created";
      props: { method: "email" | "google"; from_anonymous: boolean };
    }
  | { name: "topic_opened"; props: { topic_id: string } }
  | {
      name: "practice_started";
      props: {
        session_id: string;
        mode: PracticeMode;
        scope_kind: PracticeScopeKind;
        count: number;
        difficulty_mode: DifficultyMode;
      };
    }
  | {
      name: "question_started";
      props: {
        session_id: string;
        question_id: string;
        position: number;
        difficulty_band: DifficultyBand;
      };
    }
  | {
      name: "answer_submitted";
      props: {
        session_id: string;
        question_id: string;
        answer_type: AnswerType;
        duration_ms: number;
      };
    }
  | {
      name: "answer_correct";
      props: { question_id: string; difficulty_band: DifficultyBand; attempt_no: number };
    }
  | {
      name: "answer_incorrect";
      props: {
        question_id: string;
        difficulty_band: DifficultyBand;
        matched_common_error: boolean;
      };
    }
  | { name: "question_skipped"; props: { question_id: string; position: number } }
  | {
      name: "solution_viewed";
      props: { question_id: string; steps_revealed: number; revealed_all: boolean };
    }
  | { name: "explanation_viewed"; props: { question_id: string } }
  | {
      name: "practice_completed";
      props: { session_id: string; correct: number; total: number; duration_s: number };
    }
  | {
      name: "practice_abandoned";
      props: { session_id: string; answered: number; total: number };
    }
  | { name: "recommendation_shown"; props: { scope_id: string; reason_kind: string } }
  | { name: "recommendation_accepted"; props: { scope_id: string } }
  | { name: "progress_viewed"; props: { tab: string } }
  | { name: "paper_started"; props: { paper_id: string; mode: "practice" | "timed" } }
  | {
      name: "paper_completed";
      props: {
        paper_id: string;
        answer_marks: number;
        max_marks: number;
        duration_s: number;
      };
    }
  | {
      name: "paywall_shown";
      props: { context: "limit_reached" | "timed_mode" | "premium_topic" | "settings" };
    }
  | { name: "upgrade_tapped"; props: { context: string; product_id: string } }
  | { name: "subscription_started"; props: { product_id: string; source: string } }
  | { name: "subscription_renewed"; props: { product_id: string } }
  | {
      name: "subscription_cancelled";
      props: { product_id: string; days_active: number };
    }
  | { name: "question_reported"; props: { question_id: string; reason_code: string } }
  | { name: "bookmark_toggled"; props: { question_id: string; on: boolean } }
  | { name: "offline_session_completed"; props: { queued_attempts: number } }
  | { name: "sync_failed"; props: { reason: string; pending_count: number } }
  | {
      name: "answer_validation_discrepancy";
      props: { question_id: string; client_result: boolean; server_result: boolean };
    }
  | { name: "math_render_fallback"; props: { question_id: string; render_hash: string } }
  | { name: "app_error"; props: { code: string; screen: string } };

export type AnalyticsEventName = AnalyticsEvent["name"];

/** Narrows the union to a single event's props type by its name. */
export type AnalyticsPropsFor<Name extends AnalyticsEventName> = Extract<
  AnalyticsEvent,
  { name: Name }
>["props"];
