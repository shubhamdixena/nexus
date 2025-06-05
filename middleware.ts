import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// List of paths that don't require authentication
const publicPaths = [
  "/landing",
  "/auth/login", 
  "/auth/signup", 
  "/auth/error",
  "/auth/callback",
  "/api/auth"
]

// Paths that require authentication but don't need profile setup check
const authRequiredPaths = [
  "/profile-setup",
  "/api/profile"
]

// Admin paths that require special permissions
const adminPaths = [
  "/admin"
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Check if the path is public
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // For API routes (except auth and profile), allow them to handle their own authentication
  if (pathname.startsWith("/api/") && 
      !pathname.startsWith("/api/auth") && 
      !pathname.startsWith("/api/profile")) {
    return NextResponse.next()
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    // If not authenticated, redirect to login
    if (!user) {
      const url = new URL("/auth/login", request.url)
      
      // Use the request URL origin for callback instead of hardcoded localhost
      const callbackUrl = new URL(pathname, request.url).toString()
      
      url.searchParams.set("callbackUrl", callbackUrl)
      return NextResponse.redirect(url)
    }

    // Check if user is trying to access admin paths
    if (adminPaths.some(path => pathname.startsWith(path))) {
      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error("Error checking user role:", error)
          // Redirect to dashboard if we can't verify admin status
          return NextResponse.redirect(new URL("/", request.url))
        }

        if (profile?.role !== 'admin' && profile?.role !== 'moderator') {
          return NextResponse.redirect(new URL("/", request.url))
        }
      } catch (error) {
        console.error("Unexpected error checking user role:", error)
        return NextResponse.redirect(new URL("/", request.url))
      }
    }

    // Skip profile completion check for profile setup and API routes
    if (authRequiredPaths.some(path => pathname.startsWith(path))) {
      return response
    }

    // Check profile completion status for authenticated routes
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('profile_completed, profile_completion_percentage')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error("Error checking profile completion in middleware:", error)
        // If we can't check profile status, allow access but log the error
        return response
      }

      const isComplete = profile?.profile_completed || (profile?.profile_completion_percentage || 0) >= 80
      
      // If profile is not complete and user is not on profile setup page
      if (!isComplete && !pathname.startsWith('/profile-setup')) {
        const profileSetupUrl = new URL("/profile-setup", request.url)
        profileSetupUrl.searchParams.set("required", "true")
        return NextResponse.redirect(profileSetupUrl)
      }
    } catch (error) {
      console.error("Unexpected error checking profile completion:", error)
      // Allow access if there's an unexpected error
    }

  } catch (authError) {
    console.error("Authentication error in middleware:", authError)
    // If there's an auth error, redirect to login
    const url = new URL("/auth/login", request.url)
    url.searchParams.set("error", "auth_failed")
    return NextResponse.redirect(url)
  }

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     * - api/auth (handled separately)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
