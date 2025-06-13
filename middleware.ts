import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// List of paths that don't require authentication
const publicPaths = [
  "/landing",
  "/auth/login", 
  "/auth/signup", 
  "/auth/error",
  "/auth/callback",
  "/auth/clear-session",
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
    // Get authenticated user (secure method)
    const { data, error: userError } = await supabase.auth.getUser()
    const user = data?.user
    
    if (userError) {
      console.error("User authentication error in middleware:", userError)
      // Clear any invalid session and redirect to login
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("error", "session_invalid")
      const loginResponse = NextResponse.redirect(loginUrl)
      
      // Clear all auth-related cookies
      loginResponse.cookies.delete('sb-access-token')
      loginResponse.cookies.delete('sb-refresh-token')
      
      return loginResponse
    }

    // Check if user exists and is authenticated
    if (!user) {
      console.log("No authenticated user found, redirecting to login")
      const url = new URL("/auth/login", request.url)
      const callbackUrl = new URL(pathname, request.url).toString()
      url.searchParams.set("callbackUrl", callbackUrl)
      return NextResponse.redirect(url)
    }

    // Verify user email is confirmed
    if (!user.email_confirmed_at && !user.phone_confirmed_at) {
      console.log("User email not confirmed, redirecting to login")
      const loginUrl = new URL("/auth/login", request.url)
      loginUrl.searchParams.set("error", "email_not_confirmed")
      loginUrl.searchParams.set("message", "Please check your email and click the confirmation link before logging in.")
      return NextResponse.redirect(loginUrl)
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
        .select('profile_completed, profile_completion_percentage, created_at')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error("Error checking profile completion in middleware:", error)
        // If profile doesn't exist, create a basic one and redirect to profile setup
        if (error.code === 'PGRST116') {
          console.log("No profile found, redirecting to profile setup")
          const profileSetupUrl = new URL("/profile-setup", request.url)
          profileSetupUrl.searchParams.set("required", "true")
          return NextResponse.redirect(profileSetupUrl)
        }
        return response
      }

      // Profile completion enforcement is disabled - users can access app without completing profile
      // Analytics logging removed to reduce console noise
      
    } catch (error) {
      console.error("Unexpected error checking profile completion:", error)
      // Allow access if there's an unexpected error
    }

  } catch (authError) {
    console.error("Authentication error in middleware:", authError)
    // Clear session and redirect to login
    const loginUrl = new URL("/auth/login", request.url)
    loginUrl.searchParams.set("error", "auth_failed")
    const loginResponse = NextResponse.redirect(loginUrl)
    
    // Clear all auth-related cookies
    loginResponse.cookies.delete('sb-access-token')
    loginResponse.cookies.delete('sb-refresh-token')
    
    return loginResponse
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
