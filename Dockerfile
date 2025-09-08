FROM python:3.13.3-slim

# Cài các package cần thiết cho build và PostgreSQL
RUN apt-get update && apt-get install -y \
    build-essential \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Set working directory
WORKDIR /app

COPY requirements.txt ./

RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY *.py ./
COPY access_control ./access_control
COPY api ./api
COPY apps ./apps
COPY core ./core
COPY database ./database
COPY schemas ./schemas

# Expose port
EXPOSE 8000

# Lệnh chạy ứng dụng (dev)
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]
