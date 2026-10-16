import type { ApiErrorDetail } from '@survey/shared';
export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string, public details: ApiErrorDetail[] = []) { super(message); }
}
export const invalid = () => new ApiError(400, 'INVALID_REQUEST', '请求参数不符合接口契约');
