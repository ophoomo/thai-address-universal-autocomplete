/**
 * Unit tests for thai-address-universal adapter functions.
 *
 * These tests mock the upstream library to verify that adapters correctly:
 * - Pass queries and maxResults to the underlying search functions
 * - Return results in the expected ThaiAddressSuggestion format
 * - Handle empty queries by returning empty arrays
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ThaiAddressSuggestion } from '../src/types';

// Mock the upstream library before importing adapters
vi.mock('thai-address-universal', () => ({
  searchAddressByProvince: vi.fn(),
  searchAddressByDistrict: vi.fn(),
  searchAddressBySubDistrict: vi.fn(),
  searchAddressByPostalCode: vi.fn(),
}));

import {
  createProvinceSource,
  createDistrictSource,
  createSubDistrictSource,
  createPostalCodeSource,
} from '../src/adapters/thai-address-adapter';

import {
  searchAddressByProvince,
  searchAddressByDistrict,
  searchAddressBySubDistrict,
  searchAddressByPostalCode,
} from 'thai-address-universal';

const mockResult: ThaiAddressSuggestion[] = [
  {
    province: 'กรุงเทพมหานคร',
    district: 'คลองสาน',
    sub_district: 'คลองต้นไทร',
    postal_code: '10600',
  },
];

describe('adapter: createProvinceSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array for empty query', async () => {
    const source = createProvinceSource();
    const result = await source('');
    expect(result).toEqual([]);
    expect(searchAddressByProvince).not.toHaveBeenCalled();
  });

  it('should return empty array for whitespace-only query', async () => {
    const source = createProvinceSource();
    const result = await source('   ');
    expect(result).toEqual([]);
  });

  it('should call searchAddressByProvince with query and maxResults', async () => {
    vi.mocked(searchAddressByProvince).mockResolvedValue(mockResult);

    const source = createProvinceSource({ maxResults: 10 });
    const result = await source('กรุงเทพ');

    expect(searchAddressByProvince).toHaveBeenCalledWith('กรุงเทพ', 10);
    expect(result).toEqual(mockResult);
  });

  it('should use default maxResults of 20', async () => {
    vi.mocked(searchAddressByProvince).mockResolvedValue(mockResult);

    const source = createProvinceSource();
    await source('กรุง');

    expect(searchAddressByProvince).toHaveBeenCalledWith('กรุง', 20);
  });
});

describe('adapter: createDistrictSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array for empty query', async () => {
    const source = createDistrictSource();
    const result = await source('');
    expect(result).toEqual([]);
  });

  it('should call searchAddressByDistrict with correct args', async () => {
    vi.mocked(searchAddressByDistrict).mockResolvedValue(mockResult);

    const source = createDistrictSource({ maxResults: 5 });
    const result = await source('คลอง');

    expect(searchAddressByDistrict).toHaveBeenCalledWith('คลอง', 5);
    expect(result).toEqual(mockResult);
  });
});

describe('adapter: createSubDistrictSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array for empty query', async () => {
    const source = createSubDistrictSource();
    const result = await source('');
    expect(result).toEqual([]);
  });

  it('should call searchAddressBySubDistrict with correct args', async () => {
    vi.mocked(searchAddressBySubDistrict).mockResolvedValue(mockResult);

    const source = createSubDistrictSource({ maxResults: 15 });
    const result = await source('คลอง');

    expect(searchAddressBySubDistrict).toHaveBeenCalledWith('คลอง', 15);
    expect(result).toEqual(mockResult);
  });
});

describe('adapter: createPostalCodeSource', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array for empty query', async () => {
    const source = createPostalCodeSource();
    const result = await source('');
    expect(result).toEqual([]);
  });

  it('should call searchAddressByPostalCode with correct args', async () => {
    vi.mocked(searchAddressByPostalCode).mockResolvedValue(mockResult);

    const source = createPostalCodeSource({ maxResults: 5 });
    const result = await source('10600');

    expect(searchAddressByPostalCode).toHaveBeenCalledWith('10600', 5);
    expect(result).toEqual(mockResult);
  });
});
