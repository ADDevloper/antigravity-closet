import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Define paths that are always public (assets, api, etc)
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/api') ||
        pathname.includes('.') // file extensions like favicon.ico
    ) {
        return NextResponse.next();
    }

    // Get cookies for onboarding
    const hasOnboarded = request.cookies.has('onboarding_complete');
    const isOnboardingRoute = pathname === '/onboarding';

    // SCENARIO: User has NOT onboarded
    if (!hasOnboarded) {
        // If they are not on the onboarding page, force them there
        if (!isOnboardingRoute) {
            return NextResponse.redirect(new URL('/onboarding', request.url));
        }
        // If they are on onboarding page, let them pass
        return NextResponse.next();
    }

    // SCENARIO: User HAS onboarded
    if (hasOnboarded) {
        // If they try to go to onboarding again, usually we redirect to home
        // to prevent getting stuck in the loop, unless they explicitly want to revisit
        // but typically "Force" implies "Do it once and then you are done".
        if (isOnboardingRoute) {
            return NextResponse.redirect(new URL('/', request.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
