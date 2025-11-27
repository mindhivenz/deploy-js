#!/bin/bash

set -eux

usage() {
  echo "Usage: $0 [--push]"
  exit 1
}

# Initialize variables
PUSH=false

# Parse Args
while [[ $# -gt 0 ]]; do
  case "$1" in
  --push)
    PUSH=true
    shift
    ;;
  esac
done

# Display results
echo "Push: $PUSH"

# Set branches
current_branch=$(git branch --show-current)
echo "Current branch: $current_branch"
release_branch=release/${current_branch}
echo "Release branch: $release_branch"

# Create dist
script/mhd dist
mv package.json dist/

echo $(git diff)

echo $(git show-ref)


# Checkout the release branch
if git show-ref --verify --quiet refs/remotes/origin/$release_branch; then
  echo "Checking out existing $release_branch."
  git checkout $release_branch
else
  echo "Creating and checking out $release_branch from release."
  git fetch origin release/master:release/master
  git checkout -b $release_branch release/master
fi

# Clear root dir and move dist to root
find . \
  -type f \
  -not \( -path '*/dist/*' \
  -o -name '.gitignore' \
  -o -path '*/node_modules/*' \
  -o -path '*/.git/*' \) \
  -exec rm -rf {} +
mv dist/* .

echo $(git diff)

if git diff-index --quiet HEAD --; then
    echo "No changes to commit."
    exit 0
fi

# Make commit
git add -A
git commit -m "Release"

# Push commit
if [ "$PUSH" = true ]; then
  echo "Pushing $release_branch"
  git push origin -u HEAD
else
  echo "Would push $release_branch"
fi
