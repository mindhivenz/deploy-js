for arg in "$@"; do
  if [ "$arg" == "--push" ]; then
    push=true
  fi
done

# Create dist

mhd dist
cp package.json dist/

#  Checkout release branch

current_branch=$(git branch --show-current)
if [ "$current_branch" == "master" ]; then
  release_branch=release
else
  release_branch=release/${current_branch}
fi

git checkout -b ${release_branch}

# Make dist
find . -mindepth 1 -maxdepth 1 ! -name 'dist' ! -name '.gitignore' ! -name 'node_modules' ! -name 'deploy/node_modules' ! -name '.git' -exec rm -rf {} +
mv dist/* .

# Make commit
git add -A
git commit -m "Release"

if [ "$push" = true ]; then
  echo "Pushing to origin/$release_branch"
  git push origin/$release_branch
else
  echo "Would push to origin/$release_branch"
fi
