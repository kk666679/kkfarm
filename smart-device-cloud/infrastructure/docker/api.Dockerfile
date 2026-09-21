FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY apps/api/package.json ./apps/api/
COPY smart-device-cloud/shared/package.json ./smart-device-cloud/shared/
COPY smart-device-cloud/packages/device-protocol/package.json ./smart-device-cloud/packages/device-protocol/

RUN npm install

COPY tsconfig.json ./
COPY apps/api/tsconfig.json ./apps/api/
COPY apps/api/src ./apps/api/src
COPY smart-device-cloud/shared/src ./smart-device-cloud/shared/src
COPY smart-device-cloud/packages/device-protocol/src ./smart-device-cloud/packages/device-protocol/src

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace=apps/api"]
