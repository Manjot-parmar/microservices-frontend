

WesternCare – Microservices Architecture Demo

A full microservices demo built with React + TypeScript (frontend) and Node.js + Express (backend).
The project showcases service discovery, dynamic service availability, role-based UI flows, and cloud microservice deployment (Render).

------------------------------------------------------------
OVERVIEW
------------------------------------------------------------

This system includes:

S0 – Service Registry
- Tracks microservice URLs and UP/DOWN status
- Provides GET /discover
- Accepts service registration via POST /register
- Allows admin toggling via POST /admin/toggle

S1–S5 Microservices
- profile
- tickets
- board
- appointments
- counseling

Each service:
- Boots independently
- Registers itself with the registry
- Exposes service-specific API endpoints
- Stores data in memory

Frontend (React + Vite)
- Student / Counselor / Admin roles
- Dynamic service catalog driven by /discover
- Automatically closes service views when offline
- Support tickets, appointments, chat board, counselor status
- Background wake-up pings for cloud cold starts
- Admin controls to toggle service state

------------------------------------------------------------
PROJECT STRUCTURE
------------------------------------------------------------

backend/
  reg.js
  service.js
  package.json

frontend/
  src/App.tsx
  src/main.tsx
  src/index.css
  vite.config.ts
  package.json


------------------------------------------------------------
RUNNING THE PROJECT
------------------------------------------------------------

1) Backend Installation

cd backend
npm install

Start Registry (S0):
node reg.js
-> http://localhost:8080

Start Microservices (S1–S5):

SERVICE_NAME=profile \
REGISTRY_URL=http://localhost:8080 \
MY_URL=http://localhost:4001 \
PORT=4001 \
node service.js

Repeat for:
profile (4001)
tickets (4002)
board (4003)
appointments (4004)
counseling (4005)

------------------------------------------------------------
FRONTEND INSTALLATION
------------------------------------------------------------

cd frontend
npm install
npm run dev

-> http://localhost:5173

Configure Registry URL:

const REGISTRY_API = "http://localhost:8080";

------------------------------------------------------------
DEPLOYMENT NOTES (RENDER)
------------------------------------------------------------

Registry (S0):
- Deploy as web service
- Start: node reg.js
- Use $PORT

Microservices (S1–S5):
SERVICE_NAME=<name>
REGISTRY_URL=https://your-registry.onrender.com
MY_URL=https://this-service.onrender.com
PORT=$PORT

Services auto-register with the registry on boot.

------------------------------------------------------------
KEY FEATURES
------------------------------------------------------------

- Real-time service discovery
- Dynamic UP/DOWN toggling
- Role-based UI (Student / Counselor / Admin)
- Support ticket CRUD
- Appointment system
- Live chat board
- Cloud wake-up pings
- Auto-close offline service windows
- Clean UI using Tailwind-style utility classes

