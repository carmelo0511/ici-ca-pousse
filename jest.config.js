module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.js'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(gif|ttf|eot|svg|png)$': '<rootDir>/__mocks__/fileMock.js',
  },
  collectCoverageFrom: [
    'src/hooks/useAppState.js',
    'src/hooks/useChatGPT.js',
    'src/hooks/useExercises.js',
    'src/utils/leaderboardUtils.js',
    'src/utils/workout/workoutUtils.js',
    'src/utils/ai/safetyValidator.js',
    'src/utils/ai/aiMonitoring.js',
    'src/utils/ai/knowledgeBase.js',
    'src/utils/ai/openaiFunctions.js',
  ],
  testMatch: [
    '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
    '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
  ],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation)/)',
  ],
};
