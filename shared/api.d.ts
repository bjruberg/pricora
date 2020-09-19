import { Context } from "koa";

export interface RegisterRequest {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
}

export interface RegisterResponse {
  msg?: string;
}

export type LoginRequest = {
  email: string;
  password: string;
};

export interface LoginResponse {
  msg?: string;
  token?: string;
}

export interface CustomContext<ResponseBody> extends Context {
  body: ResponseBody;
}
