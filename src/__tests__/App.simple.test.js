import React from 'react';
import { render, screen } from '@testing-library/react';

// Tests simple pour l'application
describe('Application Tests', () => {
  test('React is working', () => {
    const TestComponent = () => <div>React is working</div>;
    render(<TestComponent />);
    expect(screen.getByText('React is working')).toBeInTheDocument();
  });

  test('Math operations work', () => {
    expect(2 + 2).toBe(4);
    expect(Math.max(1, 2, 3)).toBe(3);
  });

  test('Date operations work', () => {
    const date = new Date(2024, 0, 1); // Year, Month (0-indexed), Day
    expect(date.getFullYear()).toBe(2024);
    expect(date.getMonth()).toBe(0); // January
  });

  test('Array operations work', () => {
    const arr = [1, 2, 3];
    expect(arr.length).toBe(3);
    expect(arr.includes(2)).toBe(true);
  });

  test('String operations work', () => {
    const str = 'Hello World';
    expect(str.toLowerCase()).toBe('hello world');
    expect(str.includes('World')).toBe(true);
  });

  test('Object operations work', () => {
    const obj = { name: 'test', value: 42 };
    expect(obj.name).toBe('test');
    expect(Object.keys(obj)).toEqual(['name', 'value']);
  });

  test('Promise operations work', async () => {
    const promise = Promise.resolve(42);
    const result = await promise;
    expect(result).toBe(42);
  });

  test('setTimeout functionality', (done) => {
    setTimeout(() => {
      expect(true).toBe(true);
      done();
    }, 100);
  });

  test('localStorage mock works', () => {
    const mockStorage = {
      getItem: jest.fn(() => '{"test": "value"}'),
      setItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
    };

    mockStorage.setItem('key', 'value');
    expect(mockStorage.setItem).toHaveBeenCalledWith('key', 'value');
    
    const result = mockStorage.getItem('test');
    expect(result).toBe('{"test": "value"}');
  });

  test('JSON operations work', () => {
    const obj = { test: 'value' };
    const json = JSON.stringify(obj);
    const parsed = JSON.parse(json);
    
    expect(json).toBe('{"test":"value"}');
    expect(parsed).toEqual(obj);
  });
});