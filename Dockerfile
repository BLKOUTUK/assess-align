# Build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# Production stage
FROM node:18-alpine AS runner
WORKDIR /app

# Set to production environment
ENV NODE_ENV=production
# Ensure the app listens on all network interfaces
ENV HOST=0.0.0.0

# Copy only necessary files from the build stage
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expose the port the app will run on
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
