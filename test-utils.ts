import { jest } from "@jest/globals";

/**
 * Utility function to ensure complete mock cleanup
 */
export function resetAllMocks() {
  jest.clearAllMocks();
  jest.clearAllTimers();
  jest.resetModules();
}

/**
 * Utility function to create isolated mocks for each test
 */
export function createIsolatedMock<T>(mockFn: jest.Mocked<T>): jest.Mocked<T> {
  jest.clearAllMocks();
  return mockFn;
}

/**
 * Utility function to wait for all promises to resolve
 */
export function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

/**
 * Utility function to create a mock that returns different values based on parameters
 */
export function createParameterizedMock<T>(
  mockFn: jest.MockedFunction<T>,
  responses: Record<string, any>
): jest.MockedFunction<T> {
  return mockFn.mockImplementation((params: any) => {
    const key =
      typeof params === "object" ? JSON.stringify(params) : String(params);
    return responses[key] || responses.default;
  }) as jest.MockedFunction<T>;
}
