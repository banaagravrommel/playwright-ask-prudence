export function smokeRunId() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const suffix = Math.floor(Math.random() * 9000 + 1000);
  return `${timestamp}-${suffix}`;
}

export function smokeLabel(prefix: string) {
  return `SMOKE-${prefix}-${smokeRunId()}`;
}
