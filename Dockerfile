FROM node:slim
WORKDIR /app
COPY . /app
RUN npm install
EXPOSE 5000
CMD node server.js