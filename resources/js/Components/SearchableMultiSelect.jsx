import { XMarkIcon } from '@/Components/Icons';
import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Searchable multi-select (Import-style dropdown + Job booking–style chips).
 * @param {object} props
 * @param {Array<{ id: number|string, name?: string, email?: string }>} props.options
 * @param {number[]} props.value
 * @param {(ids: number[]) => void} props.onChange
 * @param {string} [props.placeholder]
 * @param {string} [props.emptyText]
 * @param {(item: object) => string} [props.getLabel]
 */
export default function SearchableMultiSelect({
    options = [],
    value = [],
    onChange,
    placeholder = 'Search by name or email…',
    emptyText = 'No results found',
    getLabel = (item) => {
        const n = item?.name ?? '';
        const e = item?.email ?? '';
        if (n && e) return `${n} — ${e}`;
        return n || e || String(item?.id ?? '');
    },
}) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);

    const selectedIds = useMemo(() => new Set((value || []).map((id) => String(id))), [value]);

    const filteredOptions = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return options;
        return options.filter((item) => String(getLabel(item)).toLowerCase().includes(q));
    }, [options, query, getLabel]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggle = (itemId) => {
        const idStr = String(itemId);
        const next = new Set(selectedIds);
        if (next.has(idStr)) {
            next.delete(idStr);
        } else {
            next.add(idStr);
        }
        onChange([...next].map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n)));
    };

    const removeId = (itemId) => {
        const idStr = String(itemId);
        const next = [...selectedIds].filter((s) => s !== idStr);
        onChange(next.map((s) => parseInt(s, 10)).filter((n) => !Number.isNaN(n)));
    };

    const selectedOptions = (value || [])
        .map((id) => options.find((o) => String(o.id) === String(id)))
        .filter(Boolean);

    return (
        <div className="space-y-2" ref={wrapperRef}>
            <div className="relative">
                <input
                    type="text"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-[#20A4AC] focus:outline-none focus:ring-1 focus:ring-[#20A4AC]"
                    placeholder={placeholder}
                    value={query}
                    onFocus={() => setIsOpen(true)}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                    }}
                    autoComplete="off"
                />
                {isOpen && (
                    <div className="absolute z-30 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-300 bg-white shadow-lg">
                        {filteredOptions.map((item) => {
                            const strId = String(item.id);
                            const isSelected = selectedIds.has(strId);
                            return (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => toggle(item.id)}
                                    className={`w-full border-b border-gray-50 px-3 py-2 text-left text-sm last:border-b-0 ${
                                        isSelected
                                            ? 'bg-[#20A4AC] text-white hover:bg-[#178089]'
                                            : 'text-gray-700 hover:bg-[#1a8d95] hover:text-white'
                                    }`}
                                >
                                    {getLabel(item)}
                                </button>
                            );
                        })}
                        {!filteredOptions.length && (
                            <div className="px-3 py-2 text-sm text-gray-500">{emptyText}</div>
                        )}
                    </div>
                )}
            </div>

            <p className="text-xs text-gray-500">
                {(value || []).length ? `${value.length} member(s) selected` : 'Pick one or more from the list'}
            </p>

            {selectedOptions.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {selectedOptions.map((opt) => (
                        <span
                            key={opt.id}
                            className="inline-flex max-w-full items-center gap-1 rounded-full border border-teal-200 bg-teal-50 py-0.5 pl-2.5 pr-1 text-xs font-medium text-teal-800"
                        >
                            <span className="truncate">{getLabel(opt)}</span>
                            <button
                                type="button"
                                className="rounded-full p-0.5 text-teal-700 hover:bg-teal-200 hover:text-teal-900"
                                onClick={() => removeId(opt.id)}
                                aria-label={`Remove ${getLabel(opt)}`}
                            >
                                <XMarkIcon className="h-3.5 w-3.5" />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
