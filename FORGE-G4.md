# Tests

The test suite uses Jest and React Testing Library, configured in `jest.config.js` and `jest.setup.js`. Tests are located in `src/__tests__` and cover individual games, utilities, and components. Test files include smoke tests for all boards, specific game logic tests, and helper function tests. Coverage reports are generated in the `coverage` directory. The CI pipeline runs tests automatically on pull requests via GitHub Actions defined in `.github/workflows/ci.yml`.
