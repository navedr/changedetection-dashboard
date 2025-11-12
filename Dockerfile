FROM mcr.microsoft.com/azurelinux/base/nodejs:20 AS build

WORKDIR /app

# Copy package files and configs
COPY package.json ./

# Install dependencies with cache cleanup
RUN npm install --legacy-peer-deps && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/lib/apt/lists/* /root/.npm

COPY tsconfig.json ./

COPY vite.config.server.js ./

COPY webpack.config.js ./
COPY webpack.prod.js ./

COPY src/ ./src/
COPY public/ ./public/

# Build for production
RUN npm run build:ci

# Runtime stage
FROM mcr.microsoft.com/azurelinux/base/nodejs:20 AS runtime
WORKDIR /app

# Copy package files for runtime dependencies
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/package-lock.json ./package-lock.json

# Install only production dependencies with cache cleanup
RUN npm ci --omit=dev --legacy-peer-deps && \
    npm cache clean --force && \
    rm -rf /tmp/* /var/lib/apt/lists/* /root/.npm

# Copy built application from frontend stage
COPY --from=build /app/dist/ ./dist/
COPY --from=build /app/dist-server/ ./dist-server/

# Expose port
EXPOSE 8080

# Start the application with the pre-built server (not development mode)
CMD ["npm", "run", "start:server"]
