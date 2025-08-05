# 📱 Nexus Mobile App

A React Native mobile application built with Expo for the Nexus MBA admissions platform.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- Expo CLI (`npm install -g @expo/cli`)
- iOS Simulator (Mac) or Android Studio (for Android development)
- Your existing Nexus web app running (for API calls)

### Installation & Setup

1. **Navigate to mobile directory:**
   ```bash
   cd mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment variables:**
   
   Create a `.env` file with your Supabase credentials:
   ```env
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url_here
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   EXPO_PUBLIC_API_URL=http://localhost:3000
   ```

4. **Start the development server:**
   ```bash
   npx expo start
   ```

5. **Run on different platforms:**
   - **Web**: Press `w` in the terminal or visit the web URL
   - **iOS**: Press `i` or scan QR code with Expo Go app
   - **Android**: Press `a` or scan QR code with Expo Go app

## 📱 App Structure

```
mobile/
├── src/
│   ├── components/         # Reusable UI components
│   ├── contexts/          # React contexts (Auth, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── navigation/        # Navigation setup
│   ├── screens/           # Screen components
│   ├── services/          # API services
│   └── utils/            # Utility functions
├── assets/               # Images, fonts, icons
├── App.tsx              # Main app component
└── app.json            # Expo configuration
```

## 🔧 Features Implemented

### ✅ Phase 1 - MVP (Current)
- **Authentication**: Sign up/Sign in with Supabase
- **Navigation**: Bottom tab navigation with 4 main screens
- **Home Dashboard**: User stats and quick actions
- **Schools Browser**: Browse and search MBA schools
- **Basic Profile**: User profile management
- **API Integration**: Connected to existing backend APIs

### 🚧 Coming Next - Phase 2
- **School Details**: Full school information pages
- **School Bookmarking**: Save favorite schools
- **School Comparison**: Side-by-side school comparison
- **Scholarship Explorer**: Browse and search scholarships
- **Enhanced Profile**: Complete profile management
- **Push Notifications**: Deadline reminders

### 🔮 Future - Phase 3
- **Application Tracking**: Manage applications and essays
- **Offline Mode**: Core features work offline
- **Social Features**: Share comparisons
- **Advanced Analytics**: Application insights

## 🛠 Technical Stack

- **Framework**: React Native with Expo
- **Navigation**: React Navigation v6
- **Authentication**: Supabase Auth
- **Database**: Shared with web app (Supabase)
- **API**: Reuses existing Next.js API routes
- **Storage**: Expo SecureStore for authentication
- **TypeScript**: Full type safety

## 🔗 Integration with Web App

The mobile app is designed to seamlessly integrate with your existing web application:

- **Shared APIs**: Uses the same backend APIs as your web app
- **Shared Database**: Same Supabase database and schema
- **Shared Types**: Reuses TypeScript types from `../shared/types/`
- **Same Authentication**: Users can log in on both platforms
- **Data Sync**: All data syncs between web and mobile

## 📋 Development Commands

```bash
# Start development server
npx expo start

# Run on specific platforms
npx expo start --ios
npx expo start --android
npx expo start --web

# Build for production
npx expo build:ios
npx expo build:android

# Publish updates (OTA)
npx expo publish
```

## 🔧 Configuration

### Environment Variables
Set these in your `.env` file:
- `EXPO_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `EXPO_PUBLIC_API_URL`: Your backend API URL

### API Configuration
The mobile app connects to your existing API at:
- **Development**: `http://localhost:3000/api`
- **Production**: Update `EXPO_PUBLIC_API_URL` to your deployed URL

## 📱 Testing

### On Physical Device
1. Install Expo Go app from App Store/Play Store
2. Scan QR code from Expo development server
3. App will load on your device

### On Simulator/Emulator
1. **iOS**: Requires Xcode and iOS Simulator
2. **Android**: Requires Android Studio and AVD
3. Press `i` (iOS) or `a` (Android) in Expo terminal

## 🚀 Deployment

### Using Expo Application Services (EAS)
1. Install EAS CLI: `npm install -g eas-cli`
2. Configure: `eas build:configure`
3. Build: `eas build --platform all`
4. Submit: `eas submit --platform all`

### Using Expo Classic Build
1. Build: `expo build:ios` or `expo build:android`
2. Download and submit to app stores manually

## 📋 Next Steps

1. **Set up environment variables** with your Supabase credentials
2. **Test the app** on web, iOS, and Android
3. **Customize branding** (icons, splash screen, colors)
4. **Add school details page** with full school information
5. **Implement school bookmarking** functionality
6. **Add scholarship explorer** features
7. **Set up push notifications** for deadlines
8. **Prepare for app store submission**

## 🤝 Contributing

The mobile app follows the same patterns as your web application:
- TypeScript for type safety
- Same API endpoints and data models
- Consistent UI/UX patterns
- Shared business logic where possible

## 📞 Support

- Check Expo documentation: https://docs.expo.dev/
- React Navigation docs: https://reactnavigation.org/
- Supabase React Native guide: https://supabase.com/docs/guides/getting-started/tutorials/with-expo

---

**Your mobile app is ready to use! 🎉**

Run `npx expo start` and test it on web first, then try on your mobile device with Expo Go app.
