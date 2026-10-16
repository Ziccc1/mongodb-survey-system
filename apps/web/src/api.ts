import type { ApiErrorBody, ApiErrorDetail } from '@survey/shared';
export class RequestError extends Error { constructor(public status: number, public code: string, message: string, public traceId: string, public details: ApiErrorDetail[] = []) { super(message); } }
export async function api<T>(path: string, method = 'GET', body?: unknown): Promise<T> {
  let response: Response;
  try { response = await fetch(`/api/v1${path}`, { method, credentials: 'same-origin', headers: { ...(method !== 'GET' ? { 'X-CSRF-Guard': '1' } : {}), ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}) }); }
  catch { throw new Error('无法连接服务，请检查网络后重试。创建结果不确定时，请先查看问卷列表。'); }
  const payload = await response.json();
  if (!response.ok) { const failure = payload as ApiErrorBody; throw new RequestError(response.status, failure.error.code, failure.error.message, failure.error.traceId, failure.error.details); }
  return payload.data as T;
}
