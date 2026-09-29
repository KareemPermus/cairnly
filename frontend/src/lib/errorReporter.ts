function deriveAppId(): string | undefined {
  if (process.env.NEXT_PUBLIC_APP_ID) return process.env.NEXT_PUBLIC_APP_ID;
  if (typeof window === 'undefined') return undefined;
  const m = window.location.hostname.match(/^preview-([^.]+)\./);
  return m ? m[1] : undefined;
}

let installed = false;

export function installErrorReporter() {
  if (installed || typeof window === 'undefined') return;
  installed = true;
  const url = process.env.NEXT_PUBLIC_RUNTIME_ERROR_REPORT_URL;

  const send = (message: string, stack?: string) => {
    if (!url) return;
    try {
      fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: deriveAppId(),
          message: String(message).slice(0, 2000),
          stack: stack ? String(stack).slice(0, 5000) : undefined,
          url: window.location.href,
          user_agent: navigator.userAgent,
        }),
        keepalive: true,
      }).catch(() => undefined);
    } catch {
      /* never throw from reporter */
    }
  };

  window.onerror = (msg, _src, _l, _c, err) => {
    send(typeof msg === 'string' ? msg : 'Unknown error', err?.stack);
    return false;
  };
  window.onunhandledrejection = (e: PromiseRejectionEvent) => {
    const r = e.reason;
    send(r?.message || String(r), r?.stack);
  };
  const orig = console.error.bind(console);
  console.error = (...args: unknown[]) => {
    const first = args[0] as { message?: string; stack?: string } | string;
    send(
      typeof first === 'string' ? args.map(String).join(' ') : first?.message || String(first),
      typeof first === 'object' ? first?.stack : undefined
    );
    orig(...args);
  };
}