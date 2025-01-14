# Build stage
FROM node:20-alpine as builder

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the app with production optimization
RUN npm run build

# Production stage
FROM nginx:alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy static files from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Create directories and set permissions
RUN mkdir -p /var/cache/nginx /var/run/nginx && \
    chown -R nginx:nginx /var/cache/nginx /var/run/nginx /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/run/nginx /usr/share/nginx/html && \
    # Create pid directory with correct permissions
    mkdir -p /var/run && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run /var/run/nginx.pid && \
    chmod -R 755 /var/run && \
    chmod 644 /var/run/nginx.pid

# Remove default nginx.conf to avoid permission issues
RUN rm -f /etc/nginx/nginx.conf

# Copy custom nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf
RUN chown nginx:nginx /etc/nginx/nginx.conf && \
    chmod 644 /etc/nginx/nginx.conf

# Use nginx user
USER nginx

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:80/ || exit 1

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
