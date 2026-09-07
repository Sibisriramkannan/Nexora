import React, { useState } from 'react';
import { motion } from 'framer-motion';

const ServerMap = ({ servers = [] }) => {
    const [hoveredRegion, setHoveredRegion] = useState(null);

    const regions = [
        { name: 'North America', servers: 12, online: 10, color: 'bg-blue-500', x: 18, y: 22 },
        { name: 'Europe', servers: 8, online: 7, color: 'bg-green-500', x: 45, y: 20 },
        { name: 'Asia Pacific', servers: 15, online: 12, color: 'bg-yellow-500', x: 75, y: 28 },
        { name: 'South America', servers: 5, online: 4, color: 'bg-purple-500', x: 35, y: 65 },
        { name: 'Africa', servers: 3, online: 2, color: 'bg-orange-500', x: 50, y: 50 },
        { name: 'Oceania', servers: 2, online: 2, color: 'bg-pink-500', x: 85, y: 75 }
    ];

    return (
        <div className="space-y-4">
            <div className="relative w-full h-56 bg-gradient-to-br from-[#0A0A1A] to-[#1a1a2e] rounded-xl overflow-hidden border border-white/10">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-1/4 left-0 w-full border-t border-white/20" />
                    <div className="absolute top-2/4 left-0 w-full border-t border-white/20" />
                    <div className="absolute top-3/4 left-0 w-full border-t border-white/20" />
                    <div className="absolute left-1/4 top-0 h-full border-l border-white/20" />
                    <div className="absolute left-2/4 top-0 h-full border-l border-white/20" />
                    <div className="absolute left-3/4 top-0 h-full border-l border-white/20" />
                </div>

                {regions.map((region) => (
                    <motion.div
                        key={region.name}
                        className="absolute"
                        style={{ left: `${region.x}%`, top: `${region.y}%`, transform: 'translate(-50%, -50%)' }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: regions.indexOf(region) * 0.1 }}
                        onMouseEnter={() => setHoveredRegion(region)}
                        onMouseLeave={() => setHoveredRegion(null)}
                    >
                        <div className="relative group">
                            <div className={`w-4 h-4 rounded-full ${region.color} animate-pulse`}>
                                <div className={`absolute inset-0 rounded-full ${region.color} opacity-30 animate-ping`} />
                            </div>
                            <div className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-black/90 backdrop-blur-sm rounded-lg text-xs text-white whitespace-nowrap transition-all duration-200 ${
                                hoveredRegion === region ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
                            }`}>
                                <div className="font-medium">{region.name}</div>
                                <div className="text-gray-400">{region.online}/{region.servers} servers online</div>
                            </div>
                        </div>
                    </motion.div>
                ))}

                <div className="absolute bottom-2 right-3 text-[10px] text-gray-500">Server Distribution</div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
                {regions.map((region) => (
                    <div key={region.name} className="flex items-center space-x-1.5 text-xs px-2 py-1 bg-white/5 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${region.color}`} />
                        <span className="text-gray-400">{region.name}</span>
                        <span className="text-white font-medium">{region.online}/{region.servers}</span>
                    </div>
                ))}
            </div>

            <div className="text-center text-xs text-gray-500">
                Total: {regions.reduce((acc, r) => acc + r.servers, 0)} servers across {regions.length} regions
            </div>
        </div>
    );
};

export default ServerMap;