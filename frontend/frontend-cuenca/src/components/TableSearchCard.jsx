'use client';

import { useMemo, useState } from 'react';
import DataTable from 'react-data-table-component';

export default function TableSearchCard({
  title = '',
  subtitle = '',
  data,
  columns,
  searchPlaceholder = 'Buscar…',
  filterKeys,
  filterFn,
  onSearch,
  onAdd,
  rightActions,
  pagination = true,
}) {
  const [term, setTerm] = useState('');

  // Si el padre NO provee onSearch, filtramos aquí.
  const filteredData = useMemo(() => {
    if (onSearch) return data; // controlado desde el padre
    if (!term) return data;

    const t = term.toLowerCase().trim();

    const defaultFilter = (row) =>
      JSON.stringify(row).toLowerCase().includes(t);

    const keysFilter = (row) =>
      (filterKeys || []).some((k) => String(row?.[k] ?? '').toLowerCase().includes(t));

    const fn = filterFn || (filterKeys?.length ? keysFilter : defaultFilter);
    return data.filter((row) => fn(row, t));
  }, [data, term, onSearch, filterFn, filterKeys]);

  return (
    <section className="space-y-5">
      {(title || subtitle) && (
        <header className="space-y-1">
          {title && <h1 className="text-2xl font-bold">{title}</h1>}
          {subtitle && <p className="text-neutral-600">{subtitle}</p>}
        </header>
      )}

      <div className="flex flex-wrap gap-2 items-center">
        <input
          type="text"
          placeholder={searchPlaceholder}
          value={term}
          onChange={(e) => {
            setTerm(e.target.value);
            onSearch?.(e.target.value);
          }}
          className="h-10 w-full sm:w-72 rounded-xl border border-neutral-300 px-3 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-200"
        />
        <button
          type="button"
          onClick={() => onSearch?.(term)}
          className="h-10 rounded-xl px-4 border bg-white border-neutral-300 hover:bg-neutral-50"
        >
          Buscar
        </button>
        {onAdd && (
          <button
            type="button"
            onClick={onAdd}
            className="h-10 rounded-xl px-4 border bg-green-50 border-green-300 text-green-700 hover:bg-green-100"
          >
            + Agregar
          </button>
        )}
        {rightActions}
      </div>

      <div className="rounded-xl border border-neutral-200 overflow-hidden bg-white">
        <DataTable
          columns={columns}
          data={filteredData}
          pagination={pagination}
          highlightOnHover
          striped
          responsive
          noDataComponent="No hay registros."
        />
      </div>
    </section>
  );
}
