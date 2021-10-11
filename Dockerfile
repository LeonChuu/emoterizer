FROM node
WORKDIR /opt
COPY package.json /opt 
COPY ./packages/discord /opt/packages/discord
COPY ./packages/emoterizer-transformations /opt/packages/emoterizer-transformations
RUN ["npm", "i"]
ENTRYPOINT ["node", "/opt/packages/discord/bot.js"]

