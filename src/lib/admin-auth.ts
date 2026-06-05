export function hasAdminAccess(token: string | null | undefined) {
  const reviewToken = process.env.ADMIN_REVIEW_TOKEN;

  if (!reviewToken) {
    return true;
  }

  return token === reviewToken;
}

export function getRequestAdminToken(request: Request) {
  const { searchParams } = new URL(request.url);
  return request.headers.get("x-admin-review-token") || searchParams.get("token");
}
