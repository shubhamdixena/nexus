#!/bin/bash

# Fix all API routes with [id] params to use Promise<{ id: string }>
echo "Fixing API routes with Promise params..."

# Find all files that need fixing
files=(
  "app/api/documents/[id]/route.ts"
  "app/api/scholarships/[id]/route.ts"
  "app/api/universities/[id]/route.ts"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "Fixing $file..."
    
    # Fix the type signatures
    sed -i.bak 's/{ params }: { params: { id: string } }/{ params }: { params: Promise<{ id: string }> }/g' "$file"
    
    # Add await params destructuring after each function declaration
    sed -i.bak '/export async function.*Promise<{ id: string }>/,/try {/ {
      /try {/ a\
    const { id } = await params
    }' "$file"
    
    # Replace params.id with id
    sed -i.bak 's/params\.id/id/g' "$file"
    
    echo "Fixed $file"
  else
    echo "File $file not found"
  fi
done

echo "Done!"