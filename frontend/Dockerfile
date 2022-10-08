FROM node:16-alpine

WORKDIR /code/frontend

# Copy out package.json first to make use of docker layer caching - https://docs.docker.com/get-started/09_image_best/#layer-caching - why layer caching is important
COPY package.json /code/frontend/

RUN npm install --legacy-peer-deps

#copy whole code later to avoid repeatedly installing dependecies
COPY . /code/frontend/

CMD ["npm", "run", "start"]
