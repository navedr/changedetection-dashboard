# CI/CD Setup Guide

This guide explains how to set up automated Docker image building and publishing to Docker Hub using GitHub Actions.

## Overview

The GitHub Actions workflow (`.github/workflows/docker-publish.yml`) automatically:
- Builds a Docker image on every push to main/master branch
- Pushes the image to Docker Hub with appropriate tags
- Supports multi-architecture builds (amd64 and arm64)
- Uses GitHub Actions cache to speed up builds

## Prerequisites

1. A Docker Hub account
2. A GitHub repository with this project
3. Admin access to the GitHub repository settings

## Setup Instructions

### Step 1: Create Docker Hub Access Token

1. Log in to [Docker Hub](https://hub.docker.com/)
2. Go to **Account Settings** → **Security**
3. Click **New Access Token**
4. Give it a descriptive name (e.g., "GitHub Actions - changedetection-dashboard")
5. Set permissions to **Read & Write**
6. Click **Generate**
7. **Important**: Copy the token immediately (you won't be able to see it again)

### Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add the following secrets:

   **Secret 1:**
   - Name: `DOCKERHUB_USERNAME`
   - Value: Your Docker Hub username

   **Secret 2:**
   - Name: `DOCKERHUB_TOKEN`
   - Value: The access token you created in Step 1

### Step 3: Verify Workflow

1. Push code to the main/master branch or create a pull request
2. Go to **Actions** tab in your GitHub repository
3. You should see the "Build and Push Docker Image" workflow running
4. Once complete, check your Docker Hub repository for the new image

## Workflow Triggers

The workflow runs on:
- **Push to main/master**: Builds and pushes with `latest` tag
- **Push tags** (e.g., `v1.0.0`): Builds and pushes with version tags
- **Pull requests**: Builds only (does not push to Docker Hub)

## Image Tags

The workflow automatically generates tags based on the trigger:

| Trigger | Tags Generated |
|---------|----------------|
| Push to main | `latest`, `main` |
| Push to branch `develop` | `develop` |
| Push tag `v1.2.3` | `latest`, `1.2.3`, `1.2`, `1` |
| Pull request #42 | `pr-42` (not pushed) |

## Using the Published Image

### Pull from Docker Hub

```bash
docker pull <your-dockerhub-username>/changedetection-dashboard:latest
```

### Run the Container

```bash
docker run -d \
  -p 8080:8080 \
  -e CHANGEDETECTION_URL=http://your-changedetection-instance:5000 \
  -e CHANGEDETECTION_API_KEY=your-api-key \
  -e PASSWORD=your-secure-password \
  --name changedetection-dashboard \
  <your-dockerhub-username>/changedetection-dashboard:latest
```

### Use in Docker Compose

Update your `docker-compose.yml`:

```yaml
version: '3'
services:
  changedetection:
    image: ghcr.io/dgtlmoon/changedetection.io
    container_name: changedetection
    ports:
      - "5000:5000"
    volumes:
      - ./changedetection-data:/datastore

  dashboard:
    image: <your-dockerhub-username>/changedetection-dashboard:latest
    container_name: changedetection-dashboard
    ports:
      - "8080:8080"
    environment:
      - CHANGEDETECTION_URL=http://changedetection:5000
      - CHANGEDETECTION_API_KEY=your-api-key-here
      - PASSWORD=your-secure-password
    depends_on:
      - changedetection
```

## Advanced Configuration

### Custom Image Name

To change the Docker image name, edit the `DOCKER_IMAGE_NAME` variable in `.github/workflows/docker-publish.yml`:

```yaml
env:
  DOCKER_IMAGE_NAME: your-custom-name  # Change this
```

### Build for Specific Architectures

By default, the workflow builds for both `linux/amd64` and `linux/arm64`. To change this, modify the `platforms` in the workflow:

```yaml
platforms: linux/amd64  # Only build for amd64
```

### Disable Pull Request Builds

If you don't want to build on pull requests, remove this section from the workflow:

```yaml
pull_request:
  branches:
    - main
    - master
```

## Troubleshooting

### Build Fails with Authentication Error

**Problem**: "Error: Cannot perform an interactive login from a non TTY device"

**Solution**: Verify that `DOCKERHUB_USERNAME` and `DOCKERHUB_TOKEN` secrets are correctly set in GitHub repository settings.

### Image Not Appearing on Docker Hub

**Problem**: Workflow succeeds but image doesn't appear on Docker Hub

**Solution**: 
1. Check if the repository exists on Docker Hub
2. Verify the access token has **Read & Write** permissions
3. Check if the username in the secret matches your Docker Hub username exactly

### Build Takes Too Long

**Problem**: Docker builds are slow

**Solution**: The workflow uses GitHub Actions cache. First build will be slow, subsequent builds should be faster. You can also reduce build time by:
- Optimizing your Dockerfile
- Using smaller base images
- Removing unnecessary build steps

### Multi-arch Build Fails

**Problem**: Build fails for arm64 architecture

**Solution**: Some dependencies might not support arm64. You can:
1. Build only for amd64: Change `platforms: linux/amd64`
2. Fix arm64 compatibility in your application dependencies

## Security Best Practices

1. **Never commit Docker Hub credentials** to your repository
2. **Use access tokens** instead of your Docker Hub password
3. **Limit token permissions** to only what's needed (Read & Write)
4. **Rotate tokens regularly** for better security
5. **Use separate tokens** for different projects

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Build Push Action](https://github.com/docker/build-push-action)
- [Docker Hub Access Tokens](https://docs.docker.com/docker-hub/access-tokens/)

