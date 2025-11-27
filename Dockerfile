# Use Node 20 on Debian (recommended for Puppeteer)
FROM node:25-bullseye

# Install Chromium dependencies
RUN apt-get update && apt-get install -y \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libatspi2.0-0 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libnspr4 \
    libpango-1.0-0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    wget \
    xdg-utils \
    && rm -rf /var/lib/apt/lists/*

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