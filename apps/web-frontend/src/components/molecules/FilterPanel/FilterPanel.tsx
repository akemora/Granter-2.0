'use client';

import { GrantStatus, SearchFilters } from '@/types';

interface FilterPanelProps {
  filters: SearchFilters;
  onFilterChange: (filters: Partial<SearchFilters>) => void;
}

const REGIONS = ['ES', 'EU', 'INT'];
const SECTORS = ['Technology', 'Energy', 'Health', 'Education', 'Environment'];
const STATUSES: GrantStatus[] = ['open', 'closed', 'upcoming', 'expired'];

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
      beneficiaries: undefined,
      minAmount: undefined,
      maxAmount: undefined,
      deadlineAfter: undefined,
      deadlineBefore: undefined,
      status: undefined,
    });
  };

  return (
    <div className="bg-slate-900/50 border border-slate-800/60 rounded-3xl p-6 shadow-2xl">
      <h2 className="text-lg font-semibold text-slate-100 mb-6">Filtros</h2>

      {/* Region Filter */}
      <div className="mb-6 pb-6 border-b border-slate-800/60">
        <h3 className="text-sm font-medium text-slate-100 mb-3">Región</h3>
        <div className="space-y-2">
          {REGIONS.map((region) => (
            <label key={region} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.regions?.includes(region) || false}
                onChange={() => handleRegionToggle(region)}
                className="w-4 h-4 text-blue-500 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer bg-slate-900"
              />
              <span className="ml-2 text-sm text-slate-300">{region}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Sector Filter */}
      <div className="mb-6 pb-6 border-b border-slate-800/60">
        <h3 className="text-sm font-medium text-slate-100 mb-3">Sector</h3>
        <div className="space-y-2">
          {SECTORS.map((sector) => (
            <label key={sector} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.sectors?.includes(sector) || false}
                onChange={() => handleSectorToggle(sector)}
                className="w-4 h-4 text-blue-500 border border-slate-700 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer bg-slate-900"
              />
              <span className="ml-2 text-sm text-slate-300">{sector}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amount Range Filter */}
      <div className="mb-6 pb-6 border-b border-slate-800/60">
        <h3 className="text-sm font-medium text-slate-100 mb-3">Rango de importe (EUR)</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="minAmount" className="block text-xs text-slate-500 mb-1">
              Importe mínimo
            </label>
            <input
              id="minAmount"
              type="number"
              value={filters.minAmount || ''}
              onChange={(e) =>
                handleAmountChange('minAmount', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="0"
              className="w-full px-3 py-2 border border-slate-800 rounded-2xl text-sm bg-slate-900 text-slate-100 placeholder-slate-600 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
          <div>
            <label htmlFor="maxAmount" className="block text-xs text-slate-500 mb-1">
              Importe máximo
            </label>
            <input
              id="maxAmount"
              type="number"
              value={filters.maxAmount || ''}
              onChange={(e) =>
                handleAmountChange('maxAmount', e.target.value ? Number(e.target.value) : undefined)
              }
              placeholder="1000000"
              className="w-full px-3 py-2 border border-slate-800 rounded-2xl text-sm bg-slate-900 text-slate-100 placeholder-slate-600 focus:ring-4 focus:ring-blue-500/20 outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Deadline Filter */}
      <div className="mb-6 pb-6 border-b border-slate-800/60">
        <h3 className="text-sm font-medium text-slate-100 mb-3">Fecha límite</h3>
        <div className="space-y-3">
          <div>
            <label htmlFor="deadlineAfter" className="block text-xs text-slate-500 mb-1">
              Desde
            </label>
            <input
              id="deadlineAfter"
              type="date"
              value={filters.deadlineAfter || ''}
              onChange={(e) => onFilterChange({ deadlineAfter: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-slate-800 rounded-2xl text-sm bg-slate-900 text-slate-100"
            />
          </div>
          <div>
            <label htmlFor="deadlineBefore" className="block text-xs text-slate-500 mb-1">
              Hasta
            </label>
            <input
              id="deadlineBefore"
              type="date"
              value={filters.deadlineBefore || ''}
              onChange={(e) => onFilterChange({ deadlineBefore: e.target.value || undefined })}
              className="w-full px-3 py-2 border border-slate-800 rounded-2xl text-sm bg-slate-900 text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div className="mb-6 pb-6 border-b border-slate-800/60">
        <h3 className="text-sm font-medium text-slate-100 mb-3">Estado</h3>
        <select
          value={filters.status || ''}
          onChange={(e) => onFilterChange({ status: (e.target.value || undefined) as GrantStatus | undefined })}
          className="w-full px-3 py-2 border border-slate-800 rounded-2xl text-sm bg-slate-900 text-slate-100"
        >
          <option value="">Todos</option>
          {STATUSES.map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
      </div>

      {/* Clear Filters Button */}
      <button
        onClick={handleClearFilters}
        className="w-full px-4 py-2 bg-slate-900 text-slate-300 rounded-2xl text-sm font-semibold hover:bg-slate-800 transition-colors duration-base focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Limpiar filtros
      </button>
    </div>
  );
}
