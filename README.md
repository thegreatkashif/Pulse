# Pulse

Pulse is a self-hosted network observability platform. It turns live network and system activity into a visual, interactive dashboard — device discovery, packet capture, evidence-based topology classification, security detection, and traffic analysis — built to make how networks actually work visible, not just tables of numbers.

Every number in Pulse is either real, live data, or clearly labeled as unavailable. Nothing is simulated or guessed and presented as fact.

---

## What Pulse actually does

- **System monitoring** — CPU, memory, disk, uptime, and temperature (where the OS exposes it), live via WebSocket.
- **Device discovery** — real ARP scan of your local subnet.
- **Packet capture** — real traffic to/from the host machine, using Scapy. Pulse does **not** capture other devices' traffic (that would require a mirrored switch port or ARP spoofing — neither of which Pulse does).
- **Topology classification** — not a guess. Pulse observes the actual destination MAC address of captured frames: if traffic to destinations outside your subnet is consistently addressed to your gateway's MAC, that's direct evidence of a star/hub-and-spoke topology at the network layer. If there isn't enough traffic yet, Pulse says so instead of inventing an answer.
- **Security detection** — port scan detection, ARP spoof detection, and traffic spike detection, all running against real captured packets, tuned to avoid false positives from normal browsing.
- **DNS logging** — real DNS queries and resolved IPs, extracted from captured packets.
- **Persistent storage** — SQLite, with configurable data retention and automatic daily pruning.
- **Settings** — capture interface selection and security detection thresholds, all persisted and actually applied.

## Known limitations

- Disk usage and CPU/memory work on every OS. **Temperature** only works on Linux (`psutil` has no equivalent sensor API on Windows without extra third-party tooling) — Pulse reports this honestly rather than fake a number.
- Traffic/protocol analytics reflect the current capture session only (last ~300 packets) — there's no long-term historical traffic analysis yet.
- No vendor lookup or OS fingerprinting for discovered devices yet.
- Docker packet capture only works on a **Linux Docker host**. On Windows/macOS, Docker Desktop runs containers inside a hidden VM with its own network namespace — a containerized backend there cannot see your real host traffic no matter how it's configured. This isn't a Pulse limitation, it's how Docker Desktop's networking works. Use the native run path on Windows/macOS if you need real capture.

---

## Requirements

**Common to all platforms:**
- Python 3.13+ and [`uv`](https://docs.astral.sh/uv/getting-started/installation/)
- Node.js 20+ and npm

**Windows (native capture):**
- [Npcap](https://npcap.com) installed with "WinPcap API-compatible mode" checked
- Run as Administrator

**Linux (native capture):**
- Run with `sudo` (or grant the Python interpreter `CAP_NET_RAW`/`CAP_NET_ADMIN` capabilities)

---

## Running natively

This is the only path that works identically and reliably for real packet capture on every OS.

### Windows

```powershell
# Terminal 1 — run PowerShell as Administrator
cd backend
.\run.ps1

# Terminal 2
cd frontend
.\run.ps1
```

### Linux / macOS

```bash
# Terminal 1
cd backend
sudo ./run.sh

# Terminal 2
cd frontend
./run.sh
```

Both frontend scripts start Vite bound to `0.0.0.0`, so the dashboard is reachable from other devices on your network (e.g. `http://<your-machine-ip>:5173`), not just `localhost` — useful for a classroom setting where students view from their own devices.

Backend runs on port **8001** by default in all setups (native and Docker), to keep things consistent.

---

## Running with Docker

Works on any OS for the **dashboard**. Real packet capture over Docker only works on a **Linux Docker host** (see Known Limitations above).

```bash
docker compose up --build
```

- Frontend: `http://localhost:5174`
- Backend API: `http://localhost:8001`

### Configuration

Copy `.env.example` to `.env` if you need to override defaults:
BACKEND_HOST=host.docker.internal # works out of the box on Windows/macOS Docker Desktop
BACKEND_PORT=8001


On Linux, `host.docker.internal` requires the `extra_hosts: host-gateway` mapping (already configured in `docker-compose.yml`) and your host firewall to allow traffic from Docker's private IP ranges. If you use `ufw`:

```bash
sudo ufw allow from 172.16.0.0/12
```

(This covers Docker's default private address space so a Compose rebuild that assigns a new bridge subnet doesn't silently break connectivity again.)

If you run other Docker services on your host, edit the `ports:` section of `docker-compose.yml` to avoid conflicts.

---

## Platform support summary

| Environment | Dashboard | Real packet capture |
|---|---|---|
| Native — Windows | ✅ | ✅ (Npcap + Administrator) |
| Native — Linux | ✅ | ✅ (sudo/capabilities) |
| Native — macOS | ✅ | Likely ✅ (sudo) — untested |
| Docker — Linux host | ✅ | ✅ (`network_mode: host`) |
| Docker — Windows/macOS (Docker Desktop) | ✅ | ❌ (VM network boundary) |

---

## Tech stack

**Backend:** FastAPI, Scapy, psutil, SQLite, WebSockets, `uv`

**Frontend:** React 19, TypeScript, Vite, Tailwind CSS, shadcn/ui (Radix), Framer Motion, React Flow, Recharts, Zustand, React Router, TanStack Query

---

## Project structure

Pulse/
├── backend/
│ ├── pulse/
│ │ ├── api/ # HTTP routes
│ │ ├── capture/ # Packet capture engine, DNS extraction
│ │ ├── config/
│ │ ├── database/ # SQLite layer
│ │ ├── discovery/ # ARP device discovery
│ │ ├── security/ # Port scan / ARP spoof / spike detection
│ │ ├── settings/ # Persisted capture + retention settings
│ │ ├── system/ # CPU/memory/disk/network info
│ │ ├── topology/ # Evidence-based topology classification
│ │ ├── utils/
│ │ └── websocket/ # Live stats/packets/alerts channels
│ ├── tests/
│ ├── Dockerfile
│ └── run.sh / run.ps1
└── frontend/
├── src/
│ ├── api/ # Types + REST client
│ ├── components/
│ ├── hooks/ # WebSocket hooks
│ ├── layout/ # Sidebar, topbar, shell
│ ├── pages/ # One file per sidebar section
│ └── store/
├── Dockerfile
├── nginx.conf.template
└── run.sh / run.ps1


---

## Testing

```bash
cd backend
uv run pytest -v
```

Tests cover topology classification logic, security detector thresholds, and API endpoints — all using an isolated temporary database, no admin privileges required.
