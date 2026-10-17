#!/bin/sh
# npm run wp:zip — builds upload-ready plugin zips in wordpress/dist/.
# WordPress wants each plugin inside its own folder in the zip.
set -e
cd "$(dirname "$0")"
rm -rf dist && mkdir -p dist
for plugin in yusea-content-model yusea-revalidate; do
  mkdir -p "dist/$plugin"
  cp "$plugin.php" "dist/$plugin/"
  (cd dist && zip -qr "$plugin.zip" "$plugin" && rm -rf "$plugin")
done
ls -1 dist
