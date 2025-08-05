#!/bin/bash

echo "🚀 Setting up Nexus Mobile App..."

# Check if we're in the right directory
if [ ! -f "package.json" ] || [ ! -d "src" ]; then
    echo "❌ Please run this script from the mobile directory"
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
else
    echo "✅ Dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Creating .env file..."
    cat > .env << EOL
# Expo Public Environment Variables
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
EXPO_PUBLIC_API_URL=http://localhost:3000
EOL
    echo "📝 Please update .env with your actual Supabase credentials"
else
    echo "✅ .env file already exists"
fi

echo "
🎉 Setup complete!

Next steps:
1. Update .env with your Supabase credentials
2. Make sure your web app is running on http://localhost:3000
3. Run: npx expo start
4. Test on web first (press 'w')
5. Test on mobile with Expo Go app

Happy coding! 📱
"
