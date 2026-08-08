FROM python:3.13-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpcap-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY README.md ./README.md
COPY backend/pyproject.toml backend/uv.lock ./backend/
COPY backend/pulse ./backend/pulse

WORKDIR /app/backend
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev

EXPOSE 8001

CMD ["uv", "run", "uvicorn", "pulse.main:app", "--host", "0.0.0.0", "--port", "8001"]
