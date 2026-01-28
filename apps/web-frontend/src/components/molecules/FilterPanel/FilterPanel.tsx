'use client';

import { SearchFilters } from '@/types';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
}

const REGIONS = ['ES', 'EU', 'INT'];
const SECTORS = ['Technology', 'Energy', 'Health', 'Education', 'Environment'];

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const handleRegionToggle = (region: string) => {
    const regions = filters.regions || [];
    const updated = regions.includes(region)
      ? regions.filter((r) => r !== region)
      : [...regions, region];
    onFilterChange({ regions: updated.length > 0 ? updated : undefined });
  };

  const handleSectorToggle = (sector: string) => {
    const sectors = filters.sectors || [];
    const updated = sectors.includes(sector)
      ? sectors.filter((s) => s !== sector)
      : [...sectors, sector];
    onFilterChange({ sectors: updated.length > 0 ? updated : undefined });
  };

  const handleAmountChange = (field: 'minAmount' | 'maxAmount', value: number | undefined) => {
    onFilterChange({ [field]: value });
  };

  const handleClearFilters = () => {
    onFilterChange({
      query: undefined,
      regions: undefined,
      sectors: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      deadlineAfter: undefined,
      deadlineBefore: undefined,
      status: undefined,
    });
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-neutral-900 mb-6">Filters</h2>

      {/* Region Filter */}
      <div className="mb-6 pb-6 border-b border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-900 mb-3">Region</h3>
        <div className="space-y-2">
          {REGIONS.map((region) => (
            <label key={region} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.regions?.includes(region) || false}
                onChange={() => handleRegionToggle(region)}
                className="w-4 h-4 text-primary-600 border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <span className="ml-2 text-sm text-neutral-700">{region}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sector Filter */}
      <div className="mb-6 pb-6 border-b border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-900 mb-3">Sector</h3>
        <div className="space-y-2">
          {SECTORS.map((sector) => (
            <label key={sector} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.sectors?.includes(sector) || false}
                onChange={() => handleSectorToggle(sector)}
                className="w-4 h-4 text-primary-600 border border-neutral-300 rounded focus:ring-2 focus:ring-primary-500 cursor-pointer"
              />
              <span className="ml-2 text-sm text-neutral-700">{sector}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amount Range Filter */}
      <div className="mb-6 pb-6 border-b border-neutral-200">
        <h3 className="text-sm font-medium text-neutral-900 mb-3">Amount Range (EUR)</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="minAmount" className="block text-xs text-neutral-600 mb-1">
              Minimum Amount
            </label>
            <input
              id="minAmount"
              type="number"
              value={filters.minAmount || ''}
              onChange={(e) =>
                handleAmountChange('minAmount', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="0"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-colors"
            />
          </div>
          <div>
            <label htmlFor="maxAmount" className="block text-xs text-neutral-600 mb-1">
              Maximum Amount
            </label>
            <input
              id="maxAmount"
              type="number"
              value={filters.maxAmount || ''}
              onChange={(e) =>
                handleAmountChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="1000000"
              className="w-full px-3 py-2 border border-neutral-200 rounded-lg text-sm bg-white text-neutral-900 placeholder-neutral-400 focus:border-primary-500 focus:ring-2 focus:ring-primary-200 focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={handleClearFilters}
        className="w-full px-4 py-2 bg-neutral-100 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        Clear Filters
      </button>
    </div>
  );
}
