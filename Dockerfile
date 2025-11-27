FROM ghcr.io/puppeteer/puppeteer:24.31.0

# Create non-root user for better security
RUN useradd -m -s /bin/bash nodeuser

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Use non-root user
USER nodeuser

# Use environment variable for production
ENV NODE_ENV=production

EXPOSE 3000

# Start the service
CMD ["node", "app.js"]