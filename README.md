# Real-Time Geo-Sync 🌍

Real-time map synchronization between a **Tracker** and a **Follower** using WebSockets.

## Tech Stack
- **Frontend:** Next.js 14, React 18, Leaflet.js (react-leaflet), Tailwind CSS, Axios
- **Backend:** Node.js 20, Express.js 4, Socket.io 4
- **Map Tiles:** OpenStreetMap (no API key required)

---

## Project Structure

```
real-time geo-sync/
├── client/          # Next.js frontend
│   ├── src/
│   │   ├── app/          # Next.js App Router pages
│   │   ├── components/   # HUD, RoleBadge, MapView, Modal
│   │   ├── context/      # GeoSyncContext (global state)
│   │   └── lib/          # Socket.io singleton
│   └── .env.local.example
└── server/          # Express + Socket.io backend
    ├── src/
    │   ├── index.js       # Entry point
    │   ├── rooms/         # In-memory room manager
    │   ├── routes/        # REST API (create/validate room)
    │   └── sockets/       # Socket event handlers
    └── .env.example
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/real-time-geo-sync.git
cd real-time-geo-sync
```

### 2. Set up the Server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

The server will start at **http://localhost:3001**

### 3. Set up the Client

```bash
cd client
cp .env.local.example .env.local
npm install
npm run dev
```

The client will start at **http://localhost:3000**

---

## Environment Variables

### Server (`server/.env`)
| Variable | Default | Description |
|---|---|---|
| `PORT` | `3001` | Server port |
| `CLIENT_URL` | `http://localhost:3000` | Allowed CORS origin |

### Client (`client/.env.local`)
| Variable | Default | Description |
|---|---|---|
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3001` | Backend socket URL |
| `NEXT_PUBLIC_TILE_URL` | `https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png` | Map tiles (no key needed) |

---

## How to Use

1. **Open two browser windows** — both pointing to `http://localhost:3000`
2. **Browser 1:** Click **"Create Room"** → you become the **Tracker** 📡
3. **Browser 2:** Enter the 6-character Room Code → you become the **Follower** 👁
4. **Pan or zoom the Tracker's map** → the Follower's map syncs in real-time

---

## Features

- ✅ Real-time map sync (< 100ms latency)
- ✅ 10Hz throttled event emission (no socket flooding)
- ✅ 6-decimal coordinate precision
- ✅ Glassmorphism HUD with live Lat/Lng/Zoom
- ✅ Role badges (Broadcasting / Following)
- ✅ Tracker disconnect detection + modal
- ✅ Follower map locked (Re-sync button available)
- ✅ Rate-limited REST API
- ✅ Auto reconnect with exponential backoff
- ✅ Idle room cleanup (15 min timeout)

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/rooms` | Create a new room |
| `GET` | `/api/v1/rooms/validate/:code` | Validate a room code |
| `GET` | `/health` | Server health check |

## Socket Events

| Event | Direction | Payload |
|---|---|---|
| `join-room` | Client → Server | `{ roomCode }` |
| `role-assigned` | Server → Client | `{ role: 'tracker' \| 'follower' }` |
| `map-move` | Client → Server | `{ roomCode, lat, lng, zoom }` |
| `map-update` | Server → Client | `{ lat, lng, zoom, ts }` |
| `tracker-disconnected` | Server → Client | `{ msg }` |
| `follower-joined` | Server → Client | `{ msg }` |
