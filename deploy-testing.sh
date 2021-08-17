#!/bin/bash

cd /home/mezcalier/mezcalier/back
git checkout testing
git reset --hard HEAD
git pull
npm install --legacy-peer-deps
cp ../orm.config.json ./
npm run mig:run
npm run build
pm2 restart testing

