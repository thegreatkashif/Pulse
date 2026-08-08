FROM python:3.13-slim

# libpcap-dev is needed for scapy's packet capture to work fully
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpcap-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml uv.lock ./
RUN pip install --no-cache-dir uv && uv sync --frozen --no-dev

COPY pulse ./pulse

EXPOSE 8000

CMD ["uv", "run", "uvicorn", "pulse.main:app", "--host", "0.0.0.0", "--port", "8000"]