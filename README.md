# deploy-js

## GitHub Packages Authentication

Create an `~/.npmrc` and add:
```
//npm.pkg.github.com/:_authToken=${GH_TOKEN}
@mindhivenz:registry=https://npm.pkg.github.com/
```

Generate a token with:
```
gh auth refresh --scopes write:packages
```

## Branch Development

To use a branch version of this package in a project:

- Push branch to GitHub to trigger build job
- `build.sh` compiles the ts code and pushes to a new branch `release/<your_branch>`
- Then in your project run:

``` bash
yarn add git+ssh://git@github.com:mindhivenz/deploy-js.git#release/<your_branch>
```

The project's `package.json` should be updated with:

``` json
{
  "dependencies": {
    "@mindhivenz/deploy": "git+ssh://git@github.com:mindhivenz/deploy-js.git#release/<your_branch>"
  }
}
```