FROM node:18-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install
COPY . .
# Prisma client'ı schema'ya göre generate et
RUN npx prisma generate
EXPOSE 5000
# Geliştirme ortamı için
CMD [ "npm", "run", "dev" ]