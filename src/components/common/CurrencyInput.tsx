
import React from 'react';

interface CurrencyInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  currency: string;
  locale: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
  className?: string;
}

const CurrencyInput = ({ 
  value, 
  onChange, 
  currency, 
  locale, 
  required = false, 
  id, 
  disabled = false, 
  className 
}: CurrencyInputProps) => {
    const defaultClasses = "block w-full rounded-md border-theme-strong bg-theme-surface pl-7 pr-3 py-2 shadow-sm focus:border-theme-interactive focus:ring-theme-interactive sm:text-sm text-right";
    
    const combinedClasses = className ? `${className} pl-7` : defaultClasses;

    const wrapperClass = className ? "relative" : "relative mt-1";

    return (
        <div className={wrapperClass}>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-theme-secondary sm:text-sm">{new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(0).replace(/[0-9.,]/g, '').trim()}</span>
            </div>
            <input 
                type="number" 
                id={id}
                value={value} 
                onChange={e => onChange(e.target.value === '' ? '' : parseFloat(e.target.value))} 
                required={required}
                disabled={disabled}
                min="0"
                step="any"
                className={combinedClasses}
            />
        </div>
    );
};

export default CurrencyInput;
