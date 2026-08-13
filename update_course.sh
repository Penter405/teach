#!/bin/bash

echo "Moving old assets to old folder..."
mkdir -p "docs/assets/old"

mv -f docs/assets/*.js docs/assets/old/ 2>/dev/null
mv -f docs/assets/*.css docs/assets/old/ 2>/dev/null

echo "Building the frontend course application..."
cd web_src || exit 1
npm run build
cd ..

echo
echo "Build complete! The frontend has been updated in the 'docs' folder and will use the latest data.json."