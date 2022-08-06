type Key = number | "ok" | "clientError" | "serverError" | "error" | "any";

type Handler = (_: Response) => Promise<unknown>;

type Handlers = { [K in Key]?: Handler };

type Result<H> = H extends { [K in Key]?: (_: Response) => Promise<infer R> }
  ? R
  : never;

function pickHandler(handlers: Handlers, status: number) {
  if (status in handlers) {
    return handlers[status];
  }
  if (status >= 200 && status <= 299) {
    return handlers.ok;
  }
  if (status >= 400 && status <= 499) {
    return handlers.clientError ?? handlers.error;
  }
  if (status >= 500 && status <= 599) {
    return handlers.serverError ?? handlers.error;
  }

  return handlers.any;
}

export async function fetch<H extends Handlers>(
  request: Request,
  handlers: H
): Promise<Result<H>> {
  const response = await globalThis.fetch(request).catch((error: Error) => {
    console.error(error.message);
    throw new Error(error.message);
  });

  const handler = pickHandler(handlers, response.status);

  if (handler) {
    return handler(response) as Promise<Result<H>>;
  }

  if (!response.ok) {
    throw new Error("HTTP error");
  }

  throw TypeError(
    `fetch: handler for status ${response.status} is not specified`
  );
}