FROM ghcr.io/puppeteer/puppeteer:24.34.0

# Switch to root to install node modules in /app
USER root

WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm install --production

# Copy app source
COPY . .

# Switch back to the unprivileged user provided by the base image
USER pptruser

ENV NODE_ENV=production

EXPOSE 3000

CMD ["node", "app.js"]