# Parse Args
for arg in "$@"; do
  if [ "$arg" == "--push" ]; then
    push=true
  fi
done

#  Set release branch
current_branch=$(git branch --show-current)

release_branch=release/${current_branch}

# Create dist
mhd dist
cp package.json dist/

# Checkout the release branch

if git show-ref --verify --quiet refs/heads/$release_branch; then
  echo "Checking out existing $release_branch."
  git checkout $release_branch
else
  echo "Creating and checking out $release_branch from release."
  git checkout release
  git checkout -b $release_branch release/master
fi

# Make dist
find . \
  -o -path 'dist' -prune \
  -o -name '.gitignore' -prune \
  -o -path 'node_modules' -prune \
  -o -path 'deploy/node_modules' -prune \
  -o -name '.git' -prune \
  -exec rm -rf {} +
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
