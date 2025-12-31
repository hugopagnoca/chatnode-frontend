# ChatNode Frontend

Real-time chat application built with React, TypeScript, and Socket.io.

## 🚀 Tech Stack

- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast build tool
- **Socket.io Client** - Real-time WebSocket communication
- **Zustand** - State management
- **React Router** - Client-side routing
- **Tailwind CSS** - Styling

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components (Login, Chat, etc.)
├── services/           # API and Socket.io services
│   ├── api.ts         # HTTP API calls
│   └── socket.ts      # WebSocket service
├── store/             # Zustand state management
│   └── authStore.ts   # Authentication state
├── types/             # TypeScript type definitions
└── App.tsx            # Main app component
```

## 🔧 Development

### Install Dependencies
```bash
npm install
```

### Run Development Server
```bash
npm run dev
```
Opens at http://localhost:5173

### Build for Production
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 🌐 Environment Variables

Create `.env.local` for development:

```env
VITE_API_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3000
```

For production (Railway), configure in Railway dashboard:

```env
VITE_API_URL=https://your-backend.up.railway.app/api
VITE_SOCKET_URL=https://your-backend.up.railway.app
```

**Important**: `VITE_*` variables are embedded during build time, not runtime.

## 🚀 Deployment (Railway)

1. Connect GitHub repository to Railway
2. Configure environment variables in Railway dashboard
3. Railway automatically detects Vite and builds the project
4. Access at: `https://your-app.up.railway.app`

### Build Configuration

Railway uses `railway.json`:
```json
{
  "build": {
    "buildCommand": "npm run build"
  },
  "deploy": {
    "startCommand": "npm run preview"
  }
}
```

## 🔐 Features

- User authentication (register/login)
- Real-time messaging with Socket.io
- Join/leave chat rooms
- Typing indicators
- User presence (online/offline)
- Direct messages

## 📡 API Integration

The app communicates with the backend via:
- **REST API** - Authentication, room management
- **WebSocket** - Real-time messaging and events

See `src/services/api.ts` and `src/services/socket.ts` for implementation details.

---

Built with educational purposes - demonstrating modern React patterns and real-time communication! 🎓
