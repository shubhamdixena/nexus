// Add this to any component to see cache performance
useEffect(() => {
  const stats = CacheManager.getStats()
  console.log('🚀 Cache Performance:', {
    totalEntries: stats.totalEntries,
    validEntries: stats.validEntries,
    hitRate: Math.round((stats.validEntries / stats.totalEntries) * 100) + '%',
    memoryUsage: Math.round(stats.memoryUsage / 1024) + 'KB'
  })
}, [])

// Expected output after navigation:
// 🚀 Cache Performance: {
//   totalEntries: 8,
//   validEntries: 7,
//   hitRate: "87%",
//   memoryUsage: "2KB"
// }
