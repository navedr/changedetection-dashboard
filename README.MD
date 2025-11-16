# Change Detection Dashboard
This project runs NodeJS application with React as frontend and NodeJS as backend. Follow the steps below to set up and run the project locally.

---

## Prerequisites
Ensure you have the following installed on your system:
- Node.js (>= 20.x)
---

## Setup

1. Install the required Node.js dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Start the React development server:
   ```bash
   npm run dev
   ```

---


## Local Publish

```shell
  # Build with author and version information
  docker build --platform linux/amd64 -t changedetection-dashboard .

  # Tag for registry with author namespace
  docker tag changedetection-dashboard 192.168.68.168:3030/changedetection-dashboard:latest

  # Push to registry
  docker push 192.168.68.168:3030/changedetection-dashboard:latest
```

## Local Build and Run
```shell
  docker build --platform linux/amd64 -t changedetection-dashboard . && \
  docker run -p 8080:8080 -v ./data:/app/data changedetection-dashboard
```
