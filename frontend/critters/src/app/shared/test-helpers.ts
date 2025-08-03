export function exposeToCypress(obj: Record<string, any>) {
  (window as any).testHelpers = {
    ...(window as any).testHelpers,
    ...obj,
  };
}
