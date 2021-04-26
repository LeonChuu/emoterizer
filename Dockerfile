FROM node
WORKDIR /opt
COPY . /opt
RUN ["npm", "i"]
ENTRYPOINT ["npm", "start"]

