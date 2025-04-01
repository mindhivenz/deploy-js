# release
TAG_VERSION="$1"
echo "Releasing ${TAG_VERSION}"

yarn version --no-git-tag-version --new-version $TAG_VERSION

git add package.json
git commit -m "v$TAG_VERSION"

# Push to origin?

git checkout release
yarn version --new-version $TAG_VERSION

git push origin $TAG_VERSION

git ls-remote --tags origin
