FROM node:18

WORKDIR /app

# dependencies
COPY package*.json ./
RUN npm install

# env variables are needed already during build
ARG REACT_APP_BACKEND_URL
ENV REACT_APP_BACKEND_URL $REACT_APP_BACKEND_URL

# main app
COPY . .
RUN npm run build

# serve
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
