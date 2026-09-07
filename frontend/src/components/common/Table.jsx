import React from 'react';
import { motion } from 'framer-motion';

const Table = ({
    columns,
    data,
    loading = false,
    emptyMessage = 'No data available',
    className = '',
    onRowClick,
    ...props
}) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-32">
                <div className="w-6 h-6 border-2 border-[#6C63FF] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!data || data.length === 0) {
        return (
            <div className="text-center py-8 text-gray-400">
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className={`overflow-x-auto ${className}`} {...props}>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/10">
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className="text-left py-3 px-4 text-sm font-medium text-gray-400"
                                style={{ width: column.width }}
                            >
                                {column.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.map((row, rowIndex) => (
                        <motion.tr
                            key={rowIndex}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: rowIndex * 0.05 }}
                            className={`border-b border-white/5 hover:bg-white/5 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                            onClick={() => onRowClick && onRowClick(row)}
                        >
                            {columns.map((column, colIndex) => (
                                <td
                                    key={colIndex}
                                    className="py-3 px-4 text-sm text-gray-300"
                                >
                                    {column.render ? column.render(row) : row[column.key]}
                                </td>
                            ))}
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default Table;