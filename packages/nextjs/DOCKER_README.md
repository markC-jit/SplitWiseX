# Betting Server Docker Setup

This directory contains the Docker configuration to containerize and deploy the betting server (`server.ts`) to Docker Hub.

## Files Created

- `Dockerfile` - Multi-stage Docker build configuration
- `docker-compose.yaml` - Docker Compose configuration for local development
- `.dockerignore` - Files to exclude from Docker build context
- `docker-deploy.sh` - Automated build and push script
- `DOCKER_README.md` - This documentation

## Quick Start

### 1. Prerequisites

- Docker installed and running
- Docker Hub account
- Node.js and npm/yarn (for local development)

### 2. Environment Setup

Make sure you have a `.env` file with the required environment variables:

```bash
RPC_URL=http://localhost:8545
SIMPLE_BET_CONTRACT_ADDRESS=0x...
PRIVATE_KEY=your_private_key_here
```

### 3. Build and Run Locally

#### Using Docker Compose (Recommended)
```bash
# Build and start the container
docker-compose up --build -d

# View logs
docker-compose logs -f betting-server

# Stop the container
docker-compose down
```

#### Using Docker directly
```bash
# Build the image
docker build -t betting-server:latest .

# Run the container
docker run -p 3001:3001 --env-file .env betting-server:latest
```

### 4. Deploy to Docker Hub

#### Method 1: Using the automated script
```bash
# Set your Docker Hub username
export DOCKER_USERNAME=your-dockerhub-username

# Run the deployment script
./docker-deploy.sh
```

#### Method 2: Manual deployment
```bash
# Build the image
docker build -t your-dockerhub-username/betting-server:latest .

# Test the image
docker run -d --name test-server -p 3002:3001 your-dockerhub-username/betting-server:latest

# Login to Docker Hub
docker login

# Push to Docker Hub
docker push your-dockerhub-username/betting-server:latest

# Clean up test container
docker stop test-server && docker rm test-server
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Node environment | `production` |
| `PORT` | Server port | `3001` |
| `RPC_URL` | Ethereum RPC URL | `http://localhost:8545` |
| `SIMPLE_BET_CONTRACT_ADDRESS` | Smart contract address | `0x...` |
| `PRIVATE_KEY` | Private key for server operations | - |

### Docker Compose Configuration

The `docker-compose.yaml` file includes:
- Port mapping (3001:3001)
- Environment variable support
- Health checks
- Restart policies
- Networking configuration

## Health Checks

The container includes built-in health checks that verify the server is responding:
- Endpoint: `http://localhost:3001/health`
- Interval: 30 seconds
- Timeout: 10 seconds
- Retries: 3

## Server Endpoints

Once running, the server provides the following API endpoints:

- `GET /health` - Health check
- `POST /api/siwe-login` - SIWE authentication
- `POST /api/siwe-logout` - SIWE logout
- `POST /api/siwe-verify` - Verify SIWE token
- `POST /api/optimal-split` - Calculate optimal bet splitting
- `POST /api/place-bet` - Place aggregated bets
- `POST /api/withdraw` - Withdraw user balance
- `POST /api/demo-workflow` - Run complete demo workflow

## Security Considerations

- The container runs as a non-root user (`betting`)
- Private keys should be provided via environment variables or secrets
- Use Docker secrets in production environments
- Ensure your `.env` file is not committed to version control

## Troubleshooting

### Common Issues

1. **Port conflicts**: If port 3001 is in use, modify the port mapping in `docker-compose.yaml`
2. **Permission issues**: Ensure the script is executable with `chmod +x docker-deploy.sh`
3. **Build failures**: Check that all dependencies in `package.json` are available

### Debugging

```bash
# View container logs
docker-compose logs betting-server

# Access container shell
docker-compose exec betting-server sh

# Check container health
docker inspect betting-server --format='{{.State.Health.Status}}'
```

## Production Deployment

For production deployment:

1. Use specific version tags instead of `latest`
2. Set up proper secrets management
3. Configure reverse proxy (nginx/traefik)
4. Set up monitoring and alerting
5. Use orchestration platforms (Kubernetes, Docker Swarm)

## Support

For issues related to the betting server functionality, refer to the main project documentation. For Docker-specific issues, check the Docker logs and ensure all environment variables are properly configured. 