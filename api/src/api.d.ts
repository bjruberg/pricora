import { Context } from "koa";

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  msg?: string;
}

export type LoginRequest = RegisterRequest;
export interface LoginResponse {
  msg?: string;
  token?: string;
}

export interface CustomContext<ResponseBody> extends Context {
  body: ResponseBody;
}
