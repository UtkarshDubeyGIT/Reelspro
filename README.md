<img width="696" height="63" alt="image" src="https://github.com/user-attachments/assets/8d090e3c-0778-4453-b99a-7daac1389647" />

# ReelsPro

A short-form video platform where users can upload and watch vertical videos. Similar to TikTok or Instagram Reels, with a vertical scrolling feed.

## What it does

- Users can create accounts and log in
- Users can upload videos (up to 60 seconds, 9:16 aspect ratio)
- Videos are displayed in a vertical scrolling feed
- Users can like videos and add comments
- Users can view profiles

## Tech Stack

- **Next.js 15** - React framework
- **TypeScript** - Type safety
- **MongoDB** - Database (via Mongoose)
- **NextAuth** - Authentication
- **ImageKit** - Video storage and CDN
- **Tailwind CSS** - Styling
- **shadcn/ui** - UI components

## Getting Started

### Prerequisites

- Node.js 18 or higher
- MongoDB database (local or cloud)
- ImageKit account

### Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd Reelspro
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `env.sample` to `.env.local`
   - Fill in your MongoDB connection string, NextAuth secret, and ImageKit credentials

4. Run the development server:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
  api/              # API routes
    auth/           # Authentication endpoints
    videos/         # Video CRUD and interactions
    users/          # User endpoints
  components/       # React components
  page.tsx          # Home page (video feed)
  upload/           # Video upload page
  profile/          # User profile pages
models/             # MongoDB models (User, Video, Comment)
lib/                # Utilities (database, auth, API client)
```

## API Endpoints

- `POST /api/auth/register` - Create new user account
- `POST /api/auth/[...nextauth]` - Login (NextAuth)
- `GET /api/videos` - Get list of videos
- `POST /api/videos` - Upload new video (requires auth)
- `POST /api/videos/[id]/like` - Like/unlike a video
- `POST /api/videos/[id]/comments` - Add comment to video
- `GET /api/imagekit-auth` - Get ImageKit upload credentials

## Environment Variables

Required variables (see `env.sample`):

```
MONGODB_URL=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_PUBLIC_KEY=your_imagekit_public_key
PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_URL_ENDPOINT=your_imagekit_url_endpoint
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linter

## License

MIT
