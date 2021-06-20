FROM node
WORKDIR /opt
COPY package.json /opt 
RUN ["mkdir", "/opt/packages{discord,emoterizer-transformations}", "-p"]
COPY ./packages/discord /opt/packages/discord
COPY ./packages/emoterizer-transformations /opt/packages/emoterizer-transformations
RUN ["npm", "i"]
#ENTRYPOINT ["sh", "-c", "ls", "-R"]
ENTRYPOINT ["node", "/opt/packages/discord/bottest.js"]

