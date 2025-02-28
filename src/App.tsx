import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Moon, Sun, X } from 'lucide-react';
import { TimeZone, addTimeZone, deleteTimeZone, getTimeZones } from './utils/timeZoneUtils';

function App() {
  const [timeZones, setTimeZones] = useState<TimeZone[]>([]);
  const [newTimeZoneName, setNewTimeZoneName] = useState('');
  const [newTimeZoneOffset, setNewTimeZoneOffset] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [error, setError] = useState('');
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Load time zones from localStorage on component mount
  useEffect(() => {
    setTimeZones(getTimeZones());
  }, []);

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Save dark mode preference to localStorage
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleAddTimeZone = () => {
    if (!newTimeZoneName.trim()) {
      setError('Please enter a name for the time zone');
      return;
    }

    if (!newTimeZoneOffset.trim()) {
      setError('Please enter a time zone offset');
      return;
    }

    // Validate time zone format
    const offsetRegex = /^(UTC|GMT)\s*([+-])\s*(\d{1,2})$/i;
    const match = newTimeZoneOffset.match(offsetRegex);

    if (!match) {
      setError('Please enter a valid time zone format (e.g., UTC+1, GMT-4)');
      return;
    }

    const prefix = match[1].toUpperCase();
    const sign = match[2];
    const hours = parseInt(match[3], 10);

    if (hours > 12) {
      setError('Time zone offset must be between -12 and +12');
      return;
    }

    const formattedOffset = `${prefix}${sign}${hours}`;
    const offsetValue = sign === '+' ? hours : -hours;

    const newTimeZone: TimeZone = {
      id: Date.now().toString(),
      name: newTimeZoneName,
      offset: formattedOffset,
      offsetValue: offsetValue
    };

    const updatedTimeZones = addTimeZone(newTimeZone);
    setTimeZones(updatedTimeZones);
    setNewTimeZoneName('');
    setNewTimeZoneOffset('');
    setError('');
    setShowModal(false);
  };

  const confirmDelete = (id: string) => {
    setDeleteConfirmId(id);
  };

  const cancelDelete = () => {
    setDeleteConfirmId(null);
  };

  const handleDeleteTimeZone = (id: string) => {
    const updatedTimeZones = deleteTimeZone(id);
    setTimeZones(updatedTimeZones);
    setDeleteConfirmId(null);
  };

  const formatTime = (date: Date, offsetHours: number) => {
    // Nigeria is GMT+1
    const nigeriaOffset = 1;
    
    // Calculate the time in the target time zone
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000;
    const targetTime = new Date(utcTime + (offsetHours * 3600000));
    
    return targetTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'} transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <header className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Positive Time Zone Converter
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} 
                text-white font-medium py-2 px-4 rounded-md flex items-center`}
            >
              <Plus size={18} className="mr-1" />
            </button>
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300' : 'bg-gray-200 text-gray-700'}`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        <div className={`text-center mb-8 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <p className="text-xl">
            Current time in Nigeria (GMT+1): <span className="font-bold text-2xl">{formatTime(currentTime, 1)}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {timeZones.length === 0 ? (
            <div className={`col-span-full text-center py-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl">No time zones added yet.</p>
              <p className="mt-2">Click the "Add Time Zone" button to get started.</p>
            </div>
          ) : (
            timeZones.map((tz) => (
              <div 
                key={tz.id} 
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
                  border rounded-lg p-5 hover:shadow-md transition-shadow relative`}
              >
                {deleteConfirmId === tz.id ? (
                  <div className="absolute inset-0 bg-opacity-90 flex flex-col items-center justify-center p-4 rounded-lg z-10"
                    style={{ backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}>
                    <p className={`text-center mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      Are you sure you want to delete this time zone?
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDeleteTimeZone(tz.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
                      >
                        Delete
                      </button>
                      <button
                        onClick={cancelDelete}
                        className={`${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'} 
                          px-4 py-2 rounded-md ${darkMode ? 'text-white' : 'text-gray-800'}`}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : null}
                
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className={`font-medium text-xl ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {tz.name}
                    </h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tz.offset}
                    </p>
                  </div>
                  <button
                    onClick={() => confirmDelete(tz.id)}
                    className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'} p-1`}
                    aria-label="Delete time zone"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div className={`text-center py-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <div className="text-3xl font-semibold mb-1">
                    {formatTime(currentTime, tz.offsetValue)}
                  </div>
                  <div className={`flex items-center justify-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    <Clock size={16} className="mr-2" />
                    <span>Nigeria: <span className="font-bold">{formatTime(currentTime, 1)}</span></span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Add Time Zone Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-md w-full`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Add New Time Zone
                </h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    placeholder="e.g., New York, London"
                    className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                    value={newTimeZoneName}
                    onChange={(e) => setNewTimeZoneName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label htmlFor="offset" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Time Zone
                  </label>
                  <input
                    type="text"
                    id="offset"
                    placeholder="e.g., UTC-4, GMT+2"
                    className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                    value={newTimeZoneOffset}
                    onChange={(e) => setNewTimeZoneOffset(e.target.value)}
                  />
                </div>
                
                {error && <p className="text-red-600 text-sm">{error}</p>}
                
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowModal(false)}
                    className={`mr-2 px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddTimeZone}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md flex items-center"
                  >
                    <Plus size={18} className="mr-1" /> Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;