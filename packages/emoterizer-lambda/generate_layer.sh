#!/bin/bash

mkdir node_modules nodejs
cp -r ../emoterizer-transformations/ ./node_modules
npm install

mv node_modules nodejs

zip -r layer.zip nodejs
