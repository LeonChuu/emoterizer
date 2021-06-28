FROM node
WORKDIR /opt
COPY package.json /opt 
COPY ./packages/discord /opt/packages/discord
COPY ./packages/emoterizer-transformations /opt/packages/emoterizer-transformations
RUN ["npm", "i"]
#ENTRYPOINT ["sh", "-c", "ls", "-R"]
ENTRYPOINT ["node", "/opt/packages/discord/bottest.js"]

