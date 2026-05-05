export function jsonError(error: unknown, status = 400) {
  if (error instanceof Response) return error;
  const message = error instanceof Error ? error.message : "Unexpected server error";
  return Response.json({ error: message }, { status });
}
