# Pulse

> **Pulse is an open-source, self-hosted network observability platform that transforms invisible network activity into a beautiful, interactive, real-time experience.**

Pulse helps you understand what is happening on your system and network in real time. Instead of presenting raw packets and endless tables, Pulse is designed to provide a live, visual representation of hosts, connections, protocols, traffic, and system health.

The long-term goal is simple:

> **Make networks understandable.**

---

# Vision

Modern networking tools often require users to interpret thousands of packets, logs, and metrics manually.

Pulse takes a different approach.

It continuously observes the host and surrounding network, discovers devices, analyzes traffic, and presents everything through a clean, interactive interface that anyone can explore.

Whether you're a student, researcher, system administrator, cybersecurity professional, or hobbyist, Pulse aims to make network behavior easy to understand.

---

# Features

## Current

* FastAPI backend
* Versioned REST API
* Interactive Swagger documentation
* System discovery
* CPU information
* Memory information
* Host information
* Uptime information
* Modern Python project powered by `uv`

## Planned

* Live packet capture
* Network interface discovery
* Device discovery
* Interactive topology graph
* Flow analysis
* Traffic analytics
* WebSocket live updates
* Historical storage
* Security detection engine
* Alerting
* Docker deployment
* Cross-platform support (Linux and Windows)

---

# Technology Stack

## Backend

* Python
* FastAPI
* Uvicorn
* Pydantic
* psutil

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS

## Infrastructure

* PostgreSQL
* Redis
* Docker
* Nginx

---

# Project Structure

```text
Pulse/
└── backend/
    └── pulse/
        ├── api/         # HTTP routes
        ├── config/      # App settings
        ├── discovery/   # Network device discovery
        ├── system/      # CPU/memory/host/network info
        └── utils/       # Shared helpers
```

Planned additions as features land: `frontend/`, `docs/`, `deployments/`, `scripts/`, `.github/`.

# Roadmap

* Backend Foundation
* System Discovery
* Network Interface Discovery
* Packet Capture Engine
* WebSocket Infrastructure
* Device Discovery
* Network Topology
* Traffic Analysis
* Security Detection
* Historical Analytics
* Stable v1.0 Release

---

# Running Pulse

## Requirements

* Python 3.14+
* Git
* uv

## Clone

```bash
git clone https://github.com/thegreatkashif/pulse.git
cd pulse/backend
```

## Install dependencies

```bash
uv sync
```

## Start the server

```bash
uv run uvicorn pulse.main:app --reload
```

Open:

* http://127.0.0.1:8000/
* http://127.0.0.1:8000/docs

---

# Design Principles

* Keep the architecture modular.
* Build complete features instead of partial implementations.
* Prefer clarity over cleverness.
* Keep APIs versioned from the beginning.
* Maintain cross-platform compatibility for Linux and Windows.
* Every commit should compile and run.

---

# Contributing

Contributions, ideas, bug reports, and feature requests are welcome.

Please read the contributing guidelines before submitting pull requests.

---

# License

This project is released under the MIT License.

---

**Pulse is still in active development. Every release brings it closer to becoming a modern, open-source platform for understanding networks in real time.**
