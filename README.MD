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

## Local Docker Build

```shell
  # Build with author and version information
  docker build --platform linux/amd64 -t ecarone-aws-manager .

  # Tag for registry with author namespace
  docker tag ecarone-aws-manager apps.ecar1.us:3030/ecarone-aws-manager:latest

  # Push to registry
  docker push apps.ecar1.us:3030/ecarone-aws-manager:latest
  
  # Run the container
#  docker run -p 8080:8080 -v ./config.json:/app/config.json ecarone-aws-manager
```
