
export function parseJwt(token: string): any | null {
  try {
    // Split the JWT into its 3 parts: header.payload.signature
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;

    // Replace URL-safe chars and decode base64 string
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

    // Decode percent-encoded string
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    // Parse JSON string to object and return
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Invalid JWT token:', error);
    return null;
  }
}

