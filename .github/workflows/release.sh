#!/bin/bash

set -eux

usage() {
  echo "Usage: $0 <tag> [--push]"
  exit 1
}

# Ensure one or more arguments
if [[ $# -lt 1 ]]; then
  usage
fi

# Initialize variables
TAG=""
PUSH=false

# Parse Args
while [[ $# -gt 0 ]]; do
  case "$1" in
  --push)
    PUSH=true
    shift
    ;;
  *)
    TAG="$1"
    shift
    ;;
  esac
done

# Validate that TAG is not empty
if [[ -z "$TAG" ]]; then
  usage
fi

# Remove 'v' prefix if present
TAG="${TAG#v}"

# Display results
echo "Tag: $TAG"
echo "Push: $PUSH"

# Set branches
current_branch=$(git branch --show-current)
echo "Current branch: $current_branch"
release_branch="release/$current_branch"
echo "Release branch: $release_branch"

# Create version change on current branch

yarn version --no-git-tag-version --new-version $TAG

git add package.json
git commit -m "v$TAG"

if [ "$PUSH" = true ]; then
  echo "Pushing to origin"
  git push origin
else
  echo "Would push"
fi

# Create version change and tag on release branch

git checkout $release_branch
yarn version --new-version $TAG

if [ "$PUSH" = true ]; then
  echo "Pushing tag"
  git push origin $TAG
else
  echo "Would push $TAG"
fi
