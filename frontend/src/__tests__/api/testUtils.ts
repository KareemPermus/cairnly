export function mockReqRes(opts: { method: string; query?: any; body?: any }) {
  const req: any = { method: opts.method, query: opts.query || {}, body: opts.body };
  const res: any = {
    statusCode: 200,
    body: undefined as any,
    headers: {} as Record<string, string>,
    status(code: number) { this.statusCode = code; return this; },
    json(data: any) { this.body = data; return this; },
    setHeader(k: string, v: string) { this.headers[k] = v; return this; },
  };
  return { req, res };
}