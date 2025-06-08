# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of your app's source code
COPY . .

# Expose the port your app runs on (e.g., 7777)
EXPOSE 7777

# Command to start your app
CMD ["node", "server.js"]
