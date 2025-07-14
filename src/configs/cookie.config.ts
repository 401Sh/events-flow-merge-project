type RefreshCookie = {
  httpOnly: boolean,
  secure: boolean,
  sameSite: 'strict' | 'lax' | 'none',
  path: string,
  maxAge: number
};

export const refreshCookieOptions: RefreshCookie = {
  httpOnly: true,
  secure: true,
  sameSite: "strict",
  path: '/',
  maxAge: 604800000
};