import React from 'react';

const Select = ({ label, name, value, onChange, options = [], placeholder = 'Select an option', required = false, className = '', error, ...props }) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && <label htmlFor={name} className="block text-xs font-medium text-slate-600 dark:text-slate-300">{label}{required && <span className="ml-1 text-red-500">*</span>}</label>}
        <select id={name} name={name} value={value} onChange={onChange} required={required} className={`nexora-input w-full appearance-none ${error ? 'border-red-500 focus:border-red-500' : ''}`} {...props}>
            <option value="">{placeholder}</option>
            {options.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);
export default Select;
