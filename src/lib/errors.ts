export type ApiErrorCode =
  | "LIMIT_REACHED"
  | "FEATURE_NOT_AVAILABLE"
  | "VALIDATION_ERROR"
  | "NOT_AUTHORIZED"
  | "WORKSPACE_REQUIRED"
  | "UNKNOWN";

export interface ApiErrorBody {
  error: string;
  code?: ApiErrorCode;
  feature?: string;
  limit?: number;
  currentCount?: number;
  planSlug?: string;
  workspaces?: { id: string; name: string }[];
}

export class ApiError extends Error {
  readonly status: number;
  readonly code: ApiErrorCode;
  readonly body: ApiErrorBody;
  constructor(status: number, body: ApiErrorBody) {
    super(body.error || `HTTP ${status}`);
    this.status = status;
    this.code = body.code ?? "UNKNOWN";
    this.body = body;
  }
}

export async function parseHttpError(response: Response, fallback: string): Promise<ApiError> {
  const body = await response.json().catch(() => null);
  const safeBody = isApiErrorBody(body) ? body : { error: fallback };
  if (!safeBody.error) safeBody.error = fallback;
  return new ApiError(response.status, safeBody);
}

function isApiErrorBody(body: unknown): body is ApiErrorBody {
  return Boolean(body) && typeof body === "object";
}

export function isUpgradeError(thrown: unknown): thrown is ApiError {
  if (!(thrown instanceof ApiError)) return false;
  return thrown.code === "LIMIT_REACHED" || thrown.code === "FEATURE_NOT_AVAILABLE";
}
