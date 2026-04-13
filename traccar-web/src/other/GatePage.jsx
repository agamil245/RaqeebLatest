import { useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Power, DoorOpen, DoorClosed, Activity, Clock, ScanLine, CheckCircle2,
} from 'lucide-react';

const formatTime = (value) => {
  if (!value) return '--:--:--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--:--:--';
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

const GatePage = () => {
  const [isActive, setIsActive] = useState(false);
  const [lastToggled, setLastToggled] = useState(null);

  const devices = useSelector((state) => state.devices.items);
  const groups = useSelector((state) => state.groups.items);

  const identifiedItems = useMemo(() => {
    if (!isActive) return [];
    return Object.values(devices).map((device) => {
      const group = device.groupId ? groups[device.groupId] : null;
      return {
        id: device.id,
        name: device.name,
        type: device.category || 'Device',
        location: group?.name || 'Ground Floor',
        time: formatTime(device.lastUpdate),
      };
    });
  }, [isActive, devices, groups]);

  const handleToggle = () => {
    setIsActive((prev) => !prev);
    setLastToggled(new Date());
  };

  return (
    <div className="bg-white dark:bg-gray-950 flex flex-col h-full">
      <div className="flex-1 flex flex-col px-6 py-5 min-h-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Gate</h1>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400'
              }`}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400 dark:bg-gray-500'
                }`}
              />
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0" style={{ gridTemplateRows: 'minmax(0, 1fr)' }}>
          {/* Image card (spans 2 cols on large screens) */}
          <div className="lg:col-span-2 min-h-0 flex">
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm flex-1 flex min-h-0">
              <div className="relative w-full h-full flex-1 bg-gray-50 dark:bg-gray-800 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={isActive ? 'on' : 'off'}
                    src={isActive ? '/ON.jpeg' : '/OFF.jpeg'}
                    alt={isActive ? 'Gate Active' : 'Gate Inactive'}
                    initial={{ opacity: 0, scale: 1.02 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.4, ease: 'easeOut' }}
                    className="absolute inset-0 w-full h-full object-cover object-center"
                  />
                </AnimatePresence>

                {/* Status overlay (top-left) */}
                <div className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-md bg-black/40 border border-white/10">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      isActive ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                    }`}
                  />
                  <span className="text-xs font-medium text-white uppercase tracking-wider">
                    {isActive ? 'Online' : 'Offline'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4 flex flex-col min-h-0">
            {/* Control card */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-1">
                <div
                  className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {isActive ? (
                    <DoorOpen className="h-5 w-5" />
                  ) : (
                    <DoorClosed className="h-5 w-5" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Gate Control
                  </h2>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Toggle gate state
                  </p>
                </div>
              </div>

              {/* Toggle button */}
              <button
                type="button"
                onClick={handleToggle}
                className={`mt-5 w-full h-12 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.98] ${
                  isActive
                    ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20'
                    : 'bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 text-white dark:text-gray-900 shadow-lg shadow-gray-900/10 dark:shadow-white/10'
                }`}
              >
                <Power className="h-4 w-4" strokeWidth={2.5} />
                {isActive ? 'Deactivate Gate' : 'Activate Gate'}
              </button>
            </div>

            {/* Stats card */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm space-y-4">
              <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Status Details
              </h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      State
                    </span>
                  </div>
                  <span
                    className={`text-xs font-semibold ${
                      isActive
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      Last Toggled
                    </span>
                  </div>
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {lastToggled ? formatTime(lastToggled) : '--'}
                  </span>
                </div>
              </div>
            </div>

            {/* Identified Items card */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 shadow-sm flex-1 min-h-0 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ScanLine className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                  <h3 className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Identified Items
                  </h3>
                </div>
                <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">
                  {identifiedItems.length}
                  {' '}
                  total
                </span>
              </div>

              <div className="space-y-2 overflow-y-auto flex-1 min-h-0 pr-1">
                {identifiedItems.length === 0 && (
                  <div className="h-full flex items-center justify-center text-[11px] text-gray-400 dark:text-gray-500">
                    {isActive ? 'No devices detected' : 'Activate gate to scan for devices'}
                  </div>
                )}
                {identifiedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-colors"
                  >
                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs font-semibold text-gray-900 dark:text-gray-100 truncate">
                          {item.name}
                        </p>
                        <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 flex-shrink-0">
                          {item.time}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                          {item.type}
                        </p>
                        <span className="text-[10px] font-semibold text-green-600 dark:text-green-400 truncate">
                          Found in
                          {' '}
                          {item.location}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GatePage;
