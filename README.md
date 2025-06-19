# Reelspro

Reelspro is a modern, full-stack video sharing platform built with Next.js 15, TypeScript, MongoDB (via Mongoose), and NextAuth for authentication. It features secure user registration, login, video upload (with ImageKit integration), and a responsive UI styled with Tailwind CSS and DaisyUI.

## Features

- **User Authentication:**
  - Secure registration and login using NextAuth and credentials provider.
  - Passwords are hashed with bcryptjs.
  - Session management with JWT.

- **Video Upload & Management:**
  - Upload videos and images using ImageKit (with server-side authentication).
  - Video metadata (title, description, thumbnail, etc.) stored in MongoDB.
  - Video transformation and quality settings supported.

- **API Endpoints:**
  - `/api/auth/register`: Register a new user.
  - `/api/auth/[...nextauth]`: NextAuth authentication routes.
  - `/api/imagekit-auth`: Get ImageKit authentication parameters.
  - `/api/videos`: Get all videos or upload a new video (protected route).

- **Frontend:**
  - Built with React and Next.js App Router.
  - Responsive design with Tailwind CSS and DaisyUI.
  - Modern UI with custom fonts (Geist).

- **Security:**
  - Middleware to protect API and page routes.
  - Environment variables for sensitive keys.

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB instance (local or cloud)
- ImageKit account (for media uploads)

### Installation
1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd Reelspro
   ```
2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```
3. **Configure environment variables:**
   - Copy `env.sample` to `.env.local` and fill in the required values:
     ```env
     MONGODB_URL=your_mongodb_connection_string
     NEXTAUTH_SECRET=your_nextauth_secret
     NEXT_PUBLIC_PUBLIC_KEY=your_imagekit_public_key
     PRIVATE_KEY=your_imagekit_private_key
     NEXT_PUBLIC_URL_ENDPOINT=your_imagekit_url_endpoint
     ```

4. **Run the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/
  api/
    auth/
      [...nextauth]/route.ts   # NextAuth API
      register/route.ts        # User registration API
    imagekit-auth/route.ts     # ImageKit auth API
    videos/route.ts            # Video CRUD API
  components/                  # React components
  globals.css                  # Global styles
  layout.tsx                   # App layout
  page.tsx                     # Home page
  register/page.tsx            # Register page
lib/
  api-client.ts                # API client for frontend
  auth.ts                      # NextAuth config
  db.ts                        # MongoDB connection
models/
  User.ts                      # User model
  Video.ts                     # Video model
public/                        # Static assets
```

## Key Technologies
- **Next.js 15** (App Router)
- **TypeScript**
- **MongoDB & Mongoose**
- **NextAuth** (Credentials Provider)
- **ImageKit** (Media upload & CDN)
- **Tailwind CSS & DaisyUI**

## API Overview

### Register User
- **POST** `/api/auth/register`
  - Body: `{ email, password }`
  - Response: Success or error message

### Login
- **POST** `/api/auth/[...nextauth]`
  - Handled by NextAuth

### Upload Video
- **POST** `/api/videos`
  - Requires authentication
  - Body: `{ title, description, videoUrl, thumbnailUrl, ... }`

### Get Videos
- **GET** `/api/videos`
  - Returns list of videos

### ImageKit Auth
- **GET** `/api/imagekit-auth`
  - Returns ImageKit authentication parameters

## Environment Variables
See `.env.sample` for required variables. Example:
```
MONGODB_URL=your_mongodb_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
NEXT_PUBLIC_PUBLIC_KEY=your_imagekit_public_key
PRIVATE_KEY=your_imagekit_private_key
NEXT_PUBLIC_URL_ENDPOINT=your_imagekit_url_endpoint
```

## Development Scripts
- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run start` — Start production server
- `npm run lint` — Lint codebase

## Deployment
You can deploy this app to Vercel or any Node.js hosting provider. Ensure all environment variables are set in your deployment environment.

## Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License
[MIT](LICENSE)

---

*This project follows best practices for security, scalability, and maintainability. For questions or support, please open an issue.*
