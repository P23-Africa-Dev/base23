import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_ROUTES = [
    '/login',
    '/register',
    '/forgot-password',
    '/reset-password',
    '/verify-email',
    '/confirm-password',
    '/auth-error',
];

const AUTH_ONLY_PREFIXES = [
    '/dashboard',
    '/profile',
    '/message',
    '/messages',
    '/referrals',
    '/directory',
    '/leads',
    '/dealcard',
    '/connected-users',
    '/settings',
    '/chats',
    '/subscription-required',
    '/admin',
];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Check if this is a protected route
    const isProtected = AUTH_ONLY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
    if (!isProtected) return NextResponse.next();

    // Check for Laravel session cookie
    const sessionCookie = request.cookies.get('laravel_session');
    if (!sessionCookie) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|assets|fonts|images).*)'],
};
