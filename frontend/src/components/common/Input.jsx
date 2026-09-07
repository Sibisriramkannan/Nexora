import React from 'react';

const Input = ({ label, name, type = 'text', value, onChange, placeholder, required = false, min, max, step, className = '', error, ...props }) => (
    <div className={`space-y-1.5 ${className}`}>
        {label && <label htmlFor={name} className="block text-xs font-medium text-slate-600 dark:text-slate-300">{label}{required && <span className="ml-1 text-red-500">*</span>}</label>}
        <input id={name} name={name} type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} min={min} max={max} step={step} className={`nexora-input w-full ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/10' : ''}`} {...props} />
        {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
);
export default Input;
