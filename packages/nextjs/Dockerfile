# Use Node.js 18 LTS as the base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install required system dependencies
RUN apk add --no-cache \
    python3 \
    make \
    g++

# Create a minimal package.json with only server dependencies
RUN echo '{\
  "name": "betting-server",\
  "version": "1.0.0",\
  "main": "server.js",\
  "scripts": {\
    "start": "node server.js"\
  },\
  "dependencies": {\
    "express": "^5.1.0",\
    "ethers": "^6.15.0",\
    "siwe": "^3.0.0",\
    "cors": "^2.8.5",\
    "dotenv": "^16.6.1",\
    "node-fetch": "^2.7.0"\
  },\
  "devDependencies": {\
    "@types/express": "^5.0.3",\
    "@types/cors": "^2.8.19",\
    "@types/node": "^18.19.50",\
    "@types/node-fetch": "^2.6.13",\
    "typescript": "^5.8.2"\
  }\
}' > package.json

# Install dependencies
RUN npm install

# Copy TypeScript configuration for CommonJS
RUN echo '{\
  "compilerOptions": {\
    "target": "ES2020",\
    "module": "CommonJS",\
    "moduleResolution": "node",\
    "esModuleInterop": true,\
    "allowSyntheticDefaultImports": true,\
    "strict": false,\
    "skipLibCheck": true,\
    "forceConsistentCasingInFileNames": true,\
    "resolveJsonModule": true,\
    "outDir": "./dist",\
    "rootDir": "./src"\
  },\
  "include": ["src/**/*"],\
  "exclude": ["node_modules", "dist"]\
}' > tsconfig.json

# Create src directory and copy server files
RUN mkdir -p src
COPY server.ts ./src/
COPY optimal-split-router.ts ./src/

# Copy environment files
COPY .env* ./

# Build TypeScript to JavaScript
RUN npx tsc

# Move compiled files to root
RUN mv dist/* . && rm -rf dist src

# Expose the port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production
ENV PORT=3001

# Create a non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S betting -u 1001

# Change ownership of the app directory
RUN chown -R betting:nodejs /app
USER betting

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3001/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) })"

# Start the server
CMD ["node", "server.js"] 