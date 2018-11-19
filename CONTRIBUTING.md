# Contributing

We'd love for you to help us make `enzyme-context` better!

## Setting up your dev environment

### Getting the code

```bash
# clone your fork to your local machine
git clone https://github.com/trialspark/enzyme-context.git

# step into local repo
cd enzyme-context

# install dependencies
yarn install
```

### Running tests

```bash
# Build all the packages
yarn build

# Run all tests
yarn test

# Run a TDD server
yarn test --watch
```

We use `jest` for testing so you can pass any arguments to `yarn test` that can be passed to `jest`!

### Linting & formatting

We use `prettier` to format the code and `tslint` to lint it. Code will be automatically formatted and linted whenever you commit.

## Opening PRs

If you're proposing a new feature that's non-trivial to implement, you should first open file a ticket to solicit feedback and guidance from a project maintainer. For smaller bug fixes and features, feel free to just open a PR.

Upon creating your PR you'll be presented with a checklist; make sure all the boxes are checked before submitting!
