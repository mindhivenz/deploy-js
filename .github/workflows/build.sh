# Build

mhd dist

cp package.json dist/

git checkout release

find . -mindepth 1 -maxdepth 1 ! -name 'dist' ! -name '.gitignore' ! -name 'node_modules' ! -name 'deploy/node_modules' ! -name '.git' -exec rm -rf {} +

mv dist/* .

git add -A
git commit -m "Release ${TAG_VERSION}"

# git push origin/release
