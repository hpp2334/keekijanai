base_dir=$(dirname "$0") 
name="kkbnw"
git_extract_dir="./git-extract"

cwd_in_container="/root/keekijanai/packages/keekijanai-serve-node-wrapper"

docker build -t $name $base_dir

# Run docker with cache crates and pnpm pakcages
docker run -itd \
  --name $name \
  -v $(pwd)/.cache/pnpm_store:/root/.pnpm-store \
  -v $(pwd)/.cache/cargo_registry:/root/.cargo/registry \
  -v $(pwd)/.cache/cargo_target:/root/keekijanai/target \
  $name /bin/bash

git ls-files | tar Tzcf - archive.tgz
docker cp ./archive.tgz $name:/root/keekijanai/archive.tgz
rm ./archive.tgz
echo "=== Run commands in docker ==="
docker exec $name /bin/bash -c "cd /root/keekijanai && tar -xf ./archive.tgz"

docker exec $name chown -R root /root/.pnpm-store /root/keekijanai /root/.cargo/registry /root/keekijanai/target
docker exec -w $cwd_in_container $name pnpm install
docker exec -w $cwd_in_container $name pnpm run build-release

echo "=== Output build ==="
docker cp $name:$cwd_in_container/index.node ./packages/keekijanai-serve-node-wrapper/index.node

docker stop $name
docker rm $name