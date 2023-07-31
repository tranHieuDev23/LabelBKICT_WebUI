# Build stage
FROM node:16.14.2-bullseye as build
# Install NodeJs dependencies
WORKDIR /build
COPY package.json .
COPY package-lock.json .
RUN npm install
# Build package
COPY . .
RUN npm run build

# Deploy stage
FROM nginx:1.25.1
# Copy source from build to deploy
COPY --from=build /build/dist/label.bkict.org/ /usr/app
COPY --from=build /build/deploy/ /etc/nginx/
# Run server
EXPOSE 80