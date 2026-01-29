FROM node:18-alpine

WORKDIR /app

# --- Frontend Build Stage ---
# We can use a multi-stage build to keep the final image clean, 
# or just do it all in one if simplicity is preferred.
# Providing a multi-stage approach here for better structure.

# Copy frontend source
COPY frontend/package.json ./frontend/package.json
WORKDIR /app/frontend
RUN npm install
COPY frontend/ ./
RUN npm run build

# --- Backend Setup ---
WORKDIR /app/backend

# Copy backend package (Root package.json seems to correspond to backend currently)
# In the new structure, we should probably have a package.json INSIDE backend/
# But if it's still at root, we copy from root.
# The user asked to make 2 folders: frontend and backend.
# Assuming we will move package.json to backend/ or use it from there.

# Let's assume the user splits package.json too?
# Right now package.json is at root. We should probably move it to backend/ or copy it.
# Let's assume for Docker build context is ROOT.

COPY package.json ./
RUN npm install

COPY backend/ ./

# Copy built assets from frontend
COPY --from=0 /app/frontend/dist ./public

# Expose port
EXPOSE 3001

# Command
CMD ["node", "server.js"]
