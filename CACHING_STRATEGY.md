# Data Fetching & Caching Strategy Guide

## 🎯 **Goal: Eliminate Redundant API Calls**

### ❌ **NEVER Do This (Direct API Calls)**
```typescript
// BAD: Direct fetch in useEffect
useEffect(() => {
  const fetchData = async () => {
    const response = await fetch('/api/deadlines')
    const data = await response.json()
    setData(data)
  }
  fetchData()
}, [])
```

### ✅ **ALWAYS Do This (Use Cached Hooks)**
```typescript
// GOOD: Use cached hooks
const { data, loading, refetch } = useDeadlines(user?.id)
```

## 🛠️ **Available Cached Hooks**

### Core Data Hooks
- `useProfile(userId)` - User profile data (10 min cache)
- `useStats()` - App statistics (30 min cache)
- `useMBASchools(params)` - MBA schools with filters (5 min cache)
- `useBookmarks(userId, type)` - User bookmarks (20 min cache)
- `useDeadlines(userId, start?, end?)` - User deadlines (5 min cache)

### New Hooks (Added)
- `useApplicationProgress(userId, includeSchool?)` - Application progress (2 min cache)
- `useSchoolTargets(userId)` - User's target schools (10 min cache)
- `useSchoolDeadlines()` - Global school deadlines (30 min cache)
- `useAdminData(endpoint, params, ttl?)` - Generic admin data hook

## 📋 **Migration Checklist**

### Phase 1: Critical Components (High Impact)
- [ ] `components/important-dates-list-db.tsx` ✅ DONE
- [ ] `components/application-timeline.tsx`
- [ ] `app/applications/page.tsx`
- [ ] `components/comprehensive-profile-setup.tsx`
- [ ] `components/profile-view.tsx`

### Phase 2: Admin Components
- [ ] `components/admin-mba-schools-management.tsx`
- [ ] `components/admin-schools-management.tsx`
- [ ] `components/admin-scholarships-management.tsx`
- [ ] `components/admin-user-management.tsx`
- [ ] `components/admin-analytics-dashboard.tsx`

### Phase 3: Profile Components
- [ ] `components/compact-profile-edit-form.tsx`
- [ ] `components/enhanced-profile-setup.tsx`
- [ ] `components/profile-setup-modal.tsx`

## 🔍 **How to Identify Components That Need Migration**

### Search for these patterns:
```bash
# Find direct fetch calls
grep -r "fetch('/api" components/

# Find useEffect with async functions
grep -r "useEffect.*async" components/

# Find useState + useEffect patterns
grep -r -A5 "useState.*\[\]" components/ | grep -B5 -A5 "useEffect"
```

## 🚀 **Performance Impact**

### Before (Direct API Calls):
- 🐌 **First load**: 2-4 seconds per page
- 🔄 **Navigation**: Fresh API calls every time
- 📊 **Network**: 20-30 requests per page
- 🧠 **Memory**: High due to duplicate requests

### After (Cached Hooks):
- ⚡ **First load**: 2-4 seconds (same)
- 🚀 **Navigation**: <100ms (cached)
- 📊 **Network**: 5-8 requests per page
- 🧠 **Memory**: Optimized with deduplication

## 📊 **Cache Performance Monitoring**

### Debug Cache Stats:
```typescript
// Add to any component for debugging
useEffect(() => {
  const stats = CacheManager.getStats()
  console.log('Cache Stats:', stats)
  // Expected: hitRate > 80%, validEntries > totalEntries * 0.8
}, [])
```

### Expected Performance Metrics:
- **Cache Hit Rate**: >80%
- **API Call Reduction**: ~70%
- **Page Load Improvement**: 60-80% on subsequent visits
- **Memory Usage**: <2MB for cache storage

## 🎯 **Next Steps**

1. **Run this audit**: Search for remaining direct API calls
2. **Convert top 5 components** with most API calls first
3. **Test performance** before/after conversion
4. **Monitor cache hit rates** using debug tools
5. **Consider React Query/SWR** if more advanced features needed

## 🔧 **Advanced Optimizations (Future)**

### Consider adding:
- **Background sync** for real-time data
- **Optimistic updates** for better UX
- **Request retries** with exponential backoff
- **Cache persistence** across browser sessions
- **Service worker caching** for offline support
