#!/usr/bin/env sh
# Full production build: static site -> public/, Rust Worker -> worker/build/.
#
# Used by `npm run build` and by wrangler's build step (wrangler.jsonc), so it runs both
# locally and on Cloudflare Workers Builds. The Cloudflare build image has Node and Bun
# but no Rust, so the first run there installs a minimal Rust toolchain and worker-build.
#
#   sh scripts/build.sh            site + worker
#   sh scripts/build.sh --site     site only (public/)
set -eu

cd "$(dirname "$0")/.."

# Rust: use the one on PATH, else ~/.cargo, else install it (CI only needs the minimal profile).
if ! command -v cargo >/dev/null 2>&1; then
  [ -f "$HOME/.cargo/env" ] && . "$HOME/.cargo/env"
fi
if ! command -v cargo >/dev/null 2>&1; then
  echo "==> Rust not found, installing (minimal toolchain)"
  curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs \
    | sh -s -- -y --profile minimal --default-toolchain stable --no-modify-path
  . "$HOME/.cargo/env"
fi
echo "==> $(cargo --version)"

echo "==> Building the site into public/"
cargo run --release -q -p tgl-site -- build

[ "${1:-}" = "--site" ] && exit 0

# Worker: compiled to wasm by worker-build (which also fetches wasm-bindgen and esbuild).
rustup target add wasm32-unknown-unknown >/dev/null 2>&1 || true
if ! command -v worker-build >/dev/null 2>&1; then
  echo "==> Installing worker-build"
  # keep worker-build on the same minor version as the `worker` crate (0.9)
  cargo install -q --locked worker-build --version "^0.9"
fi

echo "==> Building the Worker (wasm)"
(cd worker && worker-build --release)
echo "==> Done"
