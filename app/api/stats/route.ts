import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import ApiCache, { executeParallelQueries } from '@/lib/api-cache'

export async function GET(request: NextRequest) {
  const cacheKey = ApiCache.generateKey('stats')
  
  return ApiCache.cachedResponse(
    cacheKey,
    async () => {
      const cookieStore = await cookies()
      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return cookieStore.get(name)?.value
            },
          },
        }
      )

      // Execute all queries in parallel for much faster response
      const results = await executeParallelQueries([
        {
          key: 'universities-count',
          query: async () => {
            const { count } = await supabase
              .from("universities")
              .select("*", { count: "exact", head: true })
            return count || 0
          },
          ttl: 10 * 60 * 1000 // 10 minutes
        },
        {
          key: 'mba-schools-total',
          query: async () => {
            const { count } = await supabase
              .from("mba_schools")
              .select("*", { count: "exact", head: true })
            return count || 0
          },
          ttl: 10 * 60 * 1000
        },
        {
          key: 'mba-schools-m7',
          query: async () => {
            const { count } = await supabase
              .from("mba_schools")
              .select("*", { count: "exact", head: true })
              .eq("classification", "M7")
            return count || 0
          },
          ttl: 30 * 60 * 1000 // M7 classification rarely changes
        },
        {
          key: 'mba-schools-t15',
          query: async () => {
            const { count } = await supabase
              .from("mba_schools")
              .select("*", { count: "exact", head: true })
              .eq("classification", "T15")
            return count || 0
          },
          ttl: 30 * 60 * 1000
        },
        {
          key: 'mba-schools-top30',
          query: async () => {
            const { count } = await supabase
              .from("mba_schools")
              .select("*", { count: "exact", head: true })
              .eq("classification", "Top 30")
            return count || 0
          },
          ttl: 30 * 60 * 1000
        },
        {
          key: 'countries-count',
          query: async () => {
            const { data } = await supabase
              .from("mba_schools")
              .select("country")
              .not("country", "is", null)
            
            return new Set(data?.map(item => item.country) || []).size
          },
          ttl: 30 * 60 * 1000
        }
      ])

      return {
        data: {
          universities: results['universities-count'],
          mbaSchools: {
            total: results['mba-schools-total'],
            m7: results['mba-schools-m7'],
            t15: results['mba-schools-t15'],
            top30: results['mba-schools-top30'],
          },
          countries: results['countries-count'],
        },
        success: true,
      }
    },
    { ttl: 10 * 60 * 1000 } // Cache for 10 minutes
  )
} 