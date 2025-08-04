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
  "/profile",
  "/api/profile",
  "/mba-schools",
  "/universities", 
  "/scholarships",
  "/api/mba-schools",
  "/api/universities",
  "/api/scholarships",
  "/api/school-targets",
  "/api/school-deadlines"
]

// Admin paths that require special permissions
const adminPaths = [
  "/admin",
  "/ai-interview"
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Redirect /profile-setup to /profile (we merged them)
  if (pathname === "/profile-setup") {
    return NextResponse.redirect(new URL("/profile", request.url))
  }

  // Check if the path is public
  if (publicPaths.some((path) => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // For API routes (except auth and profile), allow them to handle their own authentication
  if (pathname.startsWith("/api/") && 
      !pathname.startsWith("/api/auth") && 
      !pathname.startsWith("/api/profile") &&
      !pathname.startsWith("/api/mba-schools") &&
      !pathname.startsWith("/api/universities") &&
      !pathname.startsWith("/api/scholarships") &&
      !pathname.startsWith("/api/school-targets") &&
      !pathname.startsWith("/api/school-deadlines")) {
    return NextResponse.next()
  }

  // Get environment variables with validation
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase environment variables in middleware')
    console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? 'present' : 'missing')
    console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'present' : 'missing')
    
    // Redirect to landing page with error
    const errorUrl = new URL("/landing", request.url)
    errorUrl.searchParams.set("error", "configuration_error")
    return NextResponse.redirect(errorUrl)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    supabaseUrl,
    supabaseAnonKey,
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
    
    // Handle auth session missing error more gracefully (this is expected for unauthenticated users)
    if (userError) {
      // Only log unexpected errors, not missing session errors
      if (userError.message !== 'Auth session missing!' && !userError.message.includes('session missing')) {
        console.error("User authentication error in middleware:", userError)
      }
      
      // For root path, redirect to landing page instead of login
      if (pathname === '/') {
        return NextResponse.redirect(new URL("/landing", request.url))
      }
      // For other paths, redirect to login with error
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
      // For root path, redirect to landing page for better UX
      if (pathname === '/') {
        return NextResponse.redirect(new URL("/landing", request.url))
      }
      // For other protected paths, redirect to login with callback
      const url = new URL("/auth/login", request.url)
      const callbackUrl = new URL(pathname, request.url).toString()
      url.searchParams.set("callbackUrl", callbackUrl)
      return NextResponse.redirect(url)
    }

    // Authenticated users can access the dashboard overview at root path
    // Remove the redirect to /applications so users see the dashboard overview by default

    // Verify user email is confirmed
    if (!user.email_confirmed_at && !user.phone_confirmed_at) {
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
        // If profile doesn't exist, create a basic one and redirect to profile
        if (error.code === 'PGRST116') {
          const profileUrl = new URL("/profile", request.url)
          profileUrl.searchParams.set("required", "true")
          return NextResponse.redirect(profileUrl)
        }
        return response
      }

      // Profile completion enforcement is disabled - users can access app without completing profile
      // Analytics logging removed to reduce console noise
      
    } catch (error) {
      console.error("Unexpected error checking profile completion:", error)
      // Allow access if there's an unexpected error
    }

  } catch (authError: unknown) {
    // Only log unexpected authentication errors
    if (!(authError instanceof Error) || !authError.message?.includes('session missing')) {
      console.error("Authentication error in middleware:", authError)
    }
    
    // For root path, redirect to landing page
    if (pathname === '/') {
      return NextResponse.redirect(new URL("/landing", request.url))
    }
    // For other paths, redirect to login
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
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
