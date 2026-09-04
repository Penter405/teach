#!/usr/bin/env bash

# Build first so a failed Vite build never leaves docs/index.html referring to
# files that have already been moved to docs/assets/old.
set -Eeuo pipefail

repo_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
web_src_dir="$repo_dir/web_src"
docs_dir="$repo_dir/docs"
assets_dir="$docs_dir/assets"
old_assets_dir="$assets_dir/old"
build_dir="$(mktemp -d "${TMPDIR:-/tmp}/teach-course-build.XXXXXX")"

cleanup() {
  rm -rf -- "$build_dir"
}
trap cleanup EXIT

if ! command -v npm >/dev/null 2>&1; then
  echo "Error: npm was not found. Install Node.js 18 or newer, then run this script again." >&2
  exit 1
fi

if [[ ! -x "$web_src_dir/node_modules/.bin/vite" ]]; then
  echo "Installing the frontend dependencies from web_src/package-lock.json..."
  (
    cd "$web_src_dir"
    npm ci
  )
fi

echo "Building the frontend course application..."
(
  cd "$web_src_dir"
  npm run build -- --outDir "$build_dir"
)

echo "Moving previous JavaScript and CSS assets to assets/old..."
mkdir -p "$old_assets_dir"
shopt -s nullglob
old_assets=("$assets_dir"/*.js "$assets_dir"/*.css)
if ((${#old_assets[@]})); then
  mv -- "${old_assets[@]}" "$old_assets_dir/"
fi

echo "Publishing the new build..."
mkdir -p "$assets_dir"
new_assets=("$build_dir/assets"/*)
if ((${#new_assets[@]})); then
  mv -- "${new_assets[@]}" "$assets_dir/"
fi
mv -- "$build_dir/index.html" "$docs_dir/index.html"

# Vite copies files from web_src/public into the build directory. Keep the
# deployed copy in sync when that public privacy page is present.
if [[ -f "$build_dir/privacy.html" ]]; then
  mv -- "$build_dir/privacy.html" "$docs_dir/privacy.html"
fi

echo
echo "Build complete! docs/index.html now references the newly published assets."
