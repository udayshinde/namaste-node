# Stage 1: Build Angular App
FROM node:20-alpine as build

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code and build the Angular app
COPY . .
RUN npm run build --configuration production

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy built Angular app to nginx public folder
COPY --from=build /app/dist/devtinder /usr/share/nginx/html

# Copy custom nginx config (optional, skip if not using)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
