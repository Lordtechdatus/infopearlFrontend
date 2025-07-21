module.exports = {
  root: true,
  extends: ['react-app', 'react-app/jest'],
  ignorePatterns: ['node_modules/', 'build/', '**/node_modules/', 'src/admin/node_modules/'],
  settings: {
    react: {
      version: 'detect'
    }
  },
  rules: {
    // Add any custom rules here
  }
}; 