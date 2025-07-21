
import React from 'react';
import { useLocalization } from '../../contexts/LocalizationContext';

interface CurrencyInputProps {
  value: number | '';
  onChange: (value: number | '') => void;
  currency: string;
  required?: boolean;
  id?: string;
  disabled?: boolean;
  className?: string;
}

const CurrencyInput = ({ 
  value, 
  onChange, 
  currency, 
  required = false, 
  id, 
  disabled = false, 
  className 
}: CurrencyInputProps) => {
    const { locale } = useLocalization();
    const defaultClasses = "block w-full rounded-md border-strong bg-surface pl-7 pr-3 py-2 shadow-sm focus:border-interactive focus:ring-interactive sm:text-sm text-right";
    
    const combinedClasses = className ? `${className} pl-7` : defaultClasses;

    const wrapperClass = className ? "relative" : "relative mt-1";

    return (
        <div className={wrapperClass}>
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <span className="text-secondary sm:text-sm">{new Intl.NumberFormat(locale, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' }).format(0).replace(/[0-9.,]/g, '').trim()}</span>
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
