FROM node:18

WORKDIR /app

# dependencies
COPY package*.json ./
RUN npm install

# main app
COPY . .
RUN npm run build

# serve
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
