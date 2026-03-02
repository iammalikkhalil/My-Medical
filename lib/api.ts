import { NextResponse } from "next/server";

type ApiResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
};

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function fail(error: string, status = 400) {
  return NextResponse.json<ApiResponse<never>>({ success: false, error }, { status });
}

export function serverError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected server error";
  return fail(message, 500);
}

