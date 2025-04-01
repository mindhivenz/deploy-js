#!/bin/bash

# Function to display usage information
usage() {
  echo "Usage: $0 <tag> [--push]"
  exit 1
}

# Check for at least one argument
if [[ $# -lt 1 ]]; then
  usage
fi

# Initialize variables
TAG=""
PUSH=false

# Loop through arguments
while [[ $# -gt 0 ]]; do
  case "$1" in
  --push)
    PUSH=true
    shift # Remove --push from arguments
    ;;
  *)
    # Assume it's the tag
    TAG="$1"
    shift # Remove tag from arguments
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

current_branch=$(git branch --show-current)
echo "Current branch: $current_branch"

release_branch="release/$current_branch"
echo "Release branch: $release_branch"

yarn version --no-git-tag-version --new-version $TAG_VERSION

git add package.json
git commit -m "v$TAG_VERSION"

if [ "$push" = true ]; then
  echo "Pushing to origin"
  git push origin
else
  echo "Would push"
fi

git checkout $release_branch
yarn version --new-version $TAG_VERSION

if [ "$push" = true ]; then
  echo "Pushing tag"
  git push origin $TAG_VERSION
else
  echo "Would push $TAG_VERSION"
fi

git ls-remote --tags origin
