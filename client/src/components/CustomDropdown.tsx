import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export interface DropdownOption {
  value: string;
  label: string;
}

interface CustomDropdownProps {
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function CustomDropdown({
  value,
  options,
  onChange,
  className = '',
}: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value) || options[0];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={dropdownRef} className={`relative inline-block text-left ${className}`}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 w-full items-center justify-between gap-2.5 rounded-xl border border-neutral-200 bg-white px-3 text-xs font-semibold text-brand-dark shadow-2xs hover:border-neutral-300 hover:bg-neutral-50/60 focus:border-brand-accent focus:outline-hidden transition-all"
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-neutral-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-brand-primary' : ''
          }`}
        />
      </button>

      {/* Floating Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-1.5 z-50 min-w-[190px] rounded-xl border border-neutral-200/90 bg-white p-1 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95 duration-150">
          <div className="space-y-0.5">
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-neutral-100/90 font-bold text-brand-dark'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-brand-dark font-medium'
                  }`}
                >
                  <span>{option.label}</span>
                  {isSelected && <Check className="h-3.5 w-3.5 text-brand-primary shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
