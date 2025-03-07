# Use Node.js 14 as required in package.json
ARG TARGETPLATFORM
FROM --platform=$TARGETPLATFORM node:16-bullseye-slim

# Install dependencies required by Puppeteer
# Install dependencies required by Puppeteer
RUN apt-get update \
    && apt-get install -y \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-kacst \
    fonts-freefont-ttf \
    libnss3 \
    libxss1 \
    libasound2 \
    libdrm2 \
    libgbm1 \
    libatk1.0-0 \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \ 
    libcups2 \
    libxkbcommon0 \ 
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean

# Set environment variables for Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false \
    PUPPETEER_EXECUTABLE_PATH=""

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies, including Puppeteer
RUN npm install --only=production

# Copy all source files (Fix missing index.js)
COPY . .

# Add user for security
RUN groupadd -r pptruser && useradd -r -g pptruser -G audio,video pptruser \
    && mkdir -p /home/pptruser/Downloads \
    && chown -R pptruser:pptruser /home/pptruser \
    && chown -R pptruser:pptruser /usr/src/app

# Switch to non-root user
USER pptruser

# Install Chromium with Puppeteer (must be done after switching user)
RUN npx puppeteer browsers install chrome

# Expose port for Express server
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
