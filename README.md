# Nexus

A comprehensive platform for managing university applications, scholarships, and educational resources.

## Features

- 🎓 University and MBA school exploration
- 📝 Application timeline management
- 💰 Scholarship discovery and filtering
- 📚 Knowledge base and documentation
- 👥 User profile and settings management
- 🔐 Secure authentication with Supabase
- 📱 Responsive design with modern UI

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI, shadcn/ui
- **Development**: ESLint, TypeScript

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Clone the repository

```bash
git clone <repository-url>
cd nexus
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment Configuration

Copy the example environment file and configure your variables:

```bash
cp .env.example .env.local
```

Required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: OpenAI API Key for AI features
OPENAI_API_KEY=your_openai_api_key
```

### 4. Supabase Setup

#### Option A: Using Supabase Cloud
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings > API to find your URL and anon key
3. Add these to your `.env.local` file

#### Option B: Local Development
1. Install Supabase CLI: `npm install -g supabase`
2. Initialize Supabase: `supabase init`
3. Start local services: `supabase start`
4. The local URLs will be displayed in terminal

### 5. Database Setup

Run the database migrations:

```bash
# For cloud Supabase
supabase db push

# For local development
supabase db reset
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
app/                    # Next.js app router pages
├── api/               # API routes
├── auth/              # Authentication pages
├── documentation/     # Documentation pages
├── profile/           # User profile pages
├── universities/      # University exploration
├── mba-schools/       # MBA school management
├── scholarships/      # Scholarship discovery
└── timeline/          # Application timeline

components/            # React components
├── ui/               # shadcn/ui components
├── providers/        # Context providers
├── admin-*.tsx       # Admin management components
└── *.tsx             # Feature components

lib/                  # Utility libraries
├── supabase/         # Supabase client and utilities
├── database-service.ts
├── user-service.ts
└── utils.ts

supabase/             # Supabase configuration
├── config.toml       # Local development config
└── migrations/       # Database migrations
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript checks

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anonymous key | Yes |
| `OPENAI_API_KEY` | OpenAI API key for AI features | No |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Manual Deployment

```bash
npm run build
npm run start
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Support

For support and questions, please open an issue in the GitHub repository.

## License

This project is licensed under the MIT License.