import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSessionFromCookies } from './utils/auth-utils';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const cookies = request.headers.get('cookie') || '';
    const session = getSessionFromCookies(cookies);

    // Protect Admin routes
    if (pathname.startsWith('/admin')) {
        if (!session || session.role !== 'admin') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Protect User routes
    if (pathname.startsWith('/user')) {
        if (!session || session.role !== 'user') {
            return NextResponse.redirect(new URL('/login', request.url));
        }
    }

    // Redirect if already logged in
    if ((pathname === '/login' || pathname === '/register') && session) {
        const redirectUrl = session.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
        return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*', '/user/:path*', '/profile', '/login', '/register'],
};
