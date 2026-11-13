export interface APIResponseEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ErrorDetail {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface APIErrorResponse {
  success: false;
  error: ErrorDetail;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}
