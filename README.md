# Mediagraph Search

A Next.js application for searching assets in your Mediagraph account using the Mediagraph API.

## Features

- Search assets by name, GUID, or metadata
- Display detailed asset information including technical metadata
- Pagination support for large result sets
- Copy GUID functionality
- Modern, responsive UI
- Error handling and loading states

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with your Mediagraph API URL:
   ```
   NEXT_PUBLIC_MEDIAGRAPH_API_URL=https://api.mediagraph.io/api
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Authentication

This application uses Personal Access Token authentication. You'll need to provide:
- Your Personal Access Token
- Organization ID (found in Profile Settings)

These credentials will be saved in your browser's localStorage for future requests.

## Development

Built with:
- Next.js 14
- React 18
- Tailwind CSS
- Lucide React for icons
- TypeScript

## Deployment

This application is optimized for deployment on Vercel. 