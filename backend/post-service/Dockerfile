FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN apt-get update && apt-get install -y --no-install-recommends gcc libpq-dev \
    && pip install --no-cache-dir -r requirements.txt \
    && apt-get purge -y --auto-remove gcc \
    && rm -rf /var/lib/apt/lists/*
COPY . .
EXPOSE 5103
CMD ["uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "5103"]


