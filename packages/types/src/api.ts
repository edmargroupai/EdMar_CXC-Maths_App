// packages/types/src/api.ts
//
// Request/response contracts (Technical Build Spec §34). Every response is
// either the relevant success shape below or the §7.3 error envelope
// (`ApiError`, from domain.ts). RPC request bodies use the literal
// `p_`-prefixed parameter names of the Postgres function they call — those
// are wire names, not table columns, and are not subject to the D-15
// snake↔camel conversion.

import type { ApiError, DifficultyMode, EntitlementTier, EntitlementStatus } from "./domain";

/** A route/RPC either returns its success shape, or the shared error envelope. */
export type ApiResult<T> = T | ApiError;

// ── §34.1 · POST /rest/v1/rpc/fn_create_practice_session ──────────────────────
export type PracticeScopeKind = "topic" | "subtopic" | "objective" | "skill";

export interface CreatePracticeSessionRequest {
  p_mode: "topic" | "recommended" | "weak_areas" | "diagnostic" | "bookmarks" | "incorrect";
  p_scope_kind: PracticeScopeKind;
  p_scope_ids: string[];
  p_count: number;
  p_difficulty_mode: DifficultyMode;
  p_client_seed: string | null;
}

export interface CreatePracticeSessionItem {
  position: number;
  questionId: string;
  questionVersionId: string;
  optionOrder: Array<"A" | "B" | "C" | "D" | "E"> | null;
}

export interface CreatePracticeSessionResponse {
  sessionId: string;
  deliveredCount: number;
  requestedCount: number;
  allowanceRemaining: number | null;
  starved: boolean;
  items: CreatePracticeSessionItem[];
}

export interface EntitlementExhaustedDetails {
  limit: number;
  used: number;
  resetsAt: string;
  upgradeAvailable: boolean;
}
export interface NoQuestionsAvailableDetails {
  topicId: string;
  publishedCount: number;
}
export interface RateLimitedDetails {
  retryAfterSeconds: number;
}
export interface InternalErrorDetails {
  traceId: string;
}
export interface ValidationFailedDetails {
  field?: string;
  received?: unknown;
  failures?: string[];
}

// ── §34.2 · POST /rest/v1/rpc/fn_record_attempt ────────────────────────────────
export interface RecordAttemptRequest {
  p_client_attempt_id: string;
  p_question_version_id: string;
  p_session_id: string | null;
  p_part_key: string | null;
  p_raw_answer: string;
  p_was_skipped: boolean;
  p_client_is_correct: boolean;
  p_duration_ms: number | null;
  p_client_created_at: string;
}

export interface RecordAttemptResponse {
  attemptId: number;
  isCorrect: boolean;
  matchedCommonErrorId: string | null;
  discrepancy: boolean;
  replayed?: boolean;
}

// ── §34.3 · GET /rest/v1/question_payloads ─────────────────────────────────────
// See `QuestionPayload` / `QuestionPayloadBody` in ./domain — the payload
// envelope is a database row shape, not a bespoke request/response contract.

// ── §34.4 · POST /api/questions/:id/publish (admin) ────────────────────────────
export interface PublishQuestionRequest {
  versionId: string;
  note: string | null;
}

export interface PublishQuestionResponse {
  ok: true;
  contentVersion: number;
}

// ── §34.5 · POST /functions/v1/verify-purchase ─────────────────────────────────
export interface VerifyPurchaseRequest {
  purchaseToken: string;
  productId: string;
}

export interface VerifyPurchaseResponse {
  tier: EntitlementTier;
  status: EntitlementStatus;
  currentPeriodEnd: string | null;
  autoRenewing: boolean;
}

export interface PurchaseNotValidDetails {
  playState: string;
}
