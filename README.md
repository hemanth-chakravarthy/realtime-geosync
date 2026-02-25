# Real-Time Geo-Sync

Real-time map synchronization between a **Tracker** and up to two **Followers** using WebSockets. The Tracker browses a map; followers see every pan and zoom update live with sub-100ms latency.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React 18, Tailwind CSS |
| Map | Leaflet.js via react-leaflet |
| Globe | cobe (WebGL, 3.8 KB) |
| Real-time | Socket.io (client + server) |
| HTTP client | Axios |
| Backend | Node.js 20, Express.js 4 |
| Security | helmet, cors, express-rate-limit |

---

## Project Structure

```
real-time geo-sync/
├── .gitignore
├── README.md
├── client/                   # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.jsx             # Root shell + GeoSyncProvider
│   │   │   ├── page.jsx               # Landing page (create / join)
│   │   │   └── room/[code]/page.jsx   # In-session map page
│   │   ├── components/
│   │   │   ├── MapView.jsx            # Leaflet map, emits + receives
│   │   │   ├── HUD.jsx                # Telemetry overlay
│   │   │   ├── RoleBadge.jsx          # Broadcasting / Following badge
│   │   │   ├── MapLayerSwitcher.jsx   # Tile layer selector
│   │   │   ├── GlobeAnimation.jsx     # WebGL spinning globe
│   │   │   └── TrackerDisconnectedModal.jsx
│   │   ├── context/
│   │   │   └── GeoSyncContext.jsx     # Global state (role, coords, status)
│   │   └── lib/
│   │       └── socket.js              # Singleton Socket.io client
│   └── .env.local.example
└── server/                   # Express + Socket.io backend
    ├── src/
    │   ├── index.js                   # Entry point
    │   ├── rooms/roomManager.js       # In-memory room store
    │   ├── routes/rooms.js            # REST: create + validate rooms
    │   └── sockets/handler.js         # All socket event logic
    └── .env.example
```

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/real-time-geo-sync.git
cd real-time-geo-sync
```

### 2. Start the server

```bash
cd server
cp .env.example .env
npm install
npm run dev
```

Server starts at **http://localhost:3001**

### 3. Start the client

```bash
cd client
cp .env.local.example .env.local
npm install
npm run dev
```

Client starts at **http://localhost:3000**

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
| `NEXT_PUBLIC_SOCKET_URL` | `http://localhost:3001` | Backend URL for socket + API calls |

---

## How to Use

1. Open two browser windows at `http://localhost:3000`
2. **Window 1:** Click **Create Room** — you become the Tracker
3. **Window 2:** Enter the 6-character room code — you become a Follower
4. Pan or zoom the Tracker's map — the Follower's map syncs in real time

Up to 3 users can share a room (1 Tracker + 2 Followers).

---

## Features

- Real-time map sync (< 100ms latency)
- 10 Hz server-side throttle — no socket flooding
- 4 switchable map tile layers: Streets, Satellite, Terrain, Dark
- Telemetry HUD with live Lat / Lng / Zoom and connection status
- Role badges: Broadcasting (Tracker) / Following (Follower)
- Tracker disconnect detection with modal overlay
- Rate-limited REST API (20 req/min per IP)
- Auto-reconnect with exponential backoff (up to 10 attempts)
- Idle room cleanup after 15 minutes
- Responsive design — works on mobile and desktop
- WebGL 3D globe on the landing page

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/rooms` | Create a new room |
| `GET` | `/api/v1/rooms/validate/:code` | Validate a room code |
| `GET` | `/health` | Server health check |

---

## Socket Events

| Event | Direction | Payload |
|---|---|---|
| `join-room` | Client to Server | `{ roomCode }` |
| `role-assigned` | Server to Client | `{ role: 'tracker' or 'follower' }` |
| `map-move` | Client to Server | `{ roomCode, lat, lng, zoom }` |
| `map-update` | Server to Client | `{ lat, lng, zoom, ts }` |
| `room-update` | Server to Client | `{ participantCount, maxParticipants }` |
| `tracker-disconnected` | Server to Client | `{ msg }` |
| `follower-joined` | Server to Client | `{ msg }` |

---
