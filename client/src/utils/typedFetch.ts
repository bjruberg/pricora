export interface TypedResponse<T = any> extends Response {
  /**
   * this will override `json` method from `Body` that is extended by `Response`
   * interface Body {
   *     json(): Promise<any>;
   * }
   */
  json<P = T>(): Promise<P>;
}

interface TypedBody<T = any> extends Omit<RequestInit, "body"> {
  body: T;
}

export function typedFetch<P, T>(url: RequestInfo, opts: TypedBody<P>): Promise<TypedResponse<T>> {
  return fetch(url, { ...opts, body: JSON.stringify(opts.body) });
}
