#!/bin/bash
npm run build
rm -rf .jsdoc docs
npx semantic-release