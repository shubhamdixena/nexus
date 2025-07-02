#!/bin/bash

echo "🔍 Scanning for components that bypass caching system..."
echo "=================================================="

echo "📋 Components with direct fetch('/api calls:"
echo "--------------------------------------------"
grep -r "fetch('/api" app/ components/ --include="*.tsx" --include="*.ts" | grep -v "node_modules" | head -20

echo ""
echo "🔄 Components with useState + useEffect patterns (potential caching candidates):"
echo "--------------------------------------------------------------------------"
# Find components that have useState with empty array and useEffect
grep -l "useState.*\[\]" app/ components/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -10

echo ""
echo "⚡ Components already using cached hooks (✅ Good):"
echo "-------------------------------------------------"
grep -r "use.*Data\|useProfile\|useStats\|useMBA" app/ components/ --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort | uniq | head -10

echo ""
echo "🎯 Priority fixes (components with most API calls):"
echo "--------------------------------------------------"
# Count fetch calls per file
grep -r "fetch('/api" app/ components/ --include="*.tsx" --include="*.ts" | cut -d: -f1 | sort | uniq -c | sort -nr | head -5

echo ""
echo "💡 Next steps:"
echo "1. Convert components with most API calls first"
echo "2. Use existing cached hooks from hooks/use-cached-data.ts"
echo "3. Add new hooks for missing patterns"
echo "4. Test performance improvements"
