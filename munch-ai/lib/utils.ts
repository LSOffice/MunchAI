import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { NextResponse } from "next/server";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// API Error handling
export class APIError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code: string = "INTERNAL_ERROR",
  ) {
    super(message);
    this.name = "APIError";
  }
}

// API Response formatting
export function successResponse(data: any, statusCode: number = 200) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status: statusCode },
  );
}

export function errorResponse(error: any) {
  if (error instanceof APIError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
        },
      },
      { status: error.statusCode },
    );
  }

  if (error instanceof Error) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: "INTERNAL_ERROR",
        },
      },
      { status: 500 },
    );
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        message: "An unknown error occurred",
        code: "INTERNAL_ERROR",
      },
    },
    { status: 500 },
  );
}

// Request validation
export function validateRequest(method: string, allowedMethods: string[]) {
  if (!allowedMethods.includes(method)) {
    throw new APIError(
      405,
      `Method ${method} not allowed`,
      "METHOD_NOT_ALLOWED",
    );
  }
}

// Client-side fetch wrapper that handles 401 errors
export async function apiFetch(
  url: string,
  options?: {
    method?: string;
    body?: any;
    headers?: Record<string, string>;
  },
) {
  const response = await fetch(url, {
    method: options?.method || "GET",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  // Handle 401 Unauthorized by redirecting to login
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      sessionStorage.setItem("authError", "You're not logged in!");
      window.location.href = "/login";
    }
    throw new APIError(401, "Unauthorized", "UNAUTHORIZED");
  }

  return response;
}
