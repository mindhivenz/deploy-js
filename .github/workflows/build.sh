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

# Clear root dir and move dist to root
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

# Push commit
if [ "$PUSH" = true ]; then
  echo "Pushing to origin/$release_branch"
  git push origin/$release_branch
else
  echo "Would push to origin/$release_branch"
fi
