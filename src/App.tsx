import React, { useState, useEffect } from 'react';
import { Clock, Plus, Trash2, Moon, Sun, X, Download, Settings, ArrowRight } from 'lucide-react';
import { 
  TimeZone, 
  addTimeZone, 
  deleteTimeZone, 
  getTimeZones, 
  downloadBatFile,
  getHomeTimeZone,
  setHomeTimeZone,
  convertTime
} from './utils/timeZoneUtils';

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
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [showHomeModal, setShowHomeModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [downloadConfirmId, setDownloadConfirmId] = useState<string | null>(null);
  const [homeTimeZone, setHomeTimeZone] = useState<TimeZone>(getHomeTimeZone());
  const [convertTime1, setConvertTime1] = useState('');
  const [convertResults, setConvertResults] = useState<{timezone: TimeZone, time: string}[]>([]);
  const [selectedFromTimeZone, setSelectedFromTimeZone] = useState<string>('home');

  // Load time zones from localStorage on component mount
  useEffect(() => {
    setTimeZones(getTimeZones());
    setHomeTimeZone(getHomeTimeZone());
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

  const confirmDownload = (id: string) => {
    setDownloadConfirmId(id);
  };

  const cancelDownload = () => {
    setDownloadConfirmId(null);
  };

  const handleDownloadBatFile = (timeZone: TimeZone) => {
    downloadBatFile(timeZone);
    setDownloadConfirmId(null);
  };

  const handleSetHomeTimeZone = () => {
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

    const newHomeTimeZone: TimeZone = {
      id: 'home',
      name: 'HOME',
      offset: formattedOffset,
      offsetValue: offsetValue
    };

    setHomeTimeZone(newHomeTimeZone);
    setNewTimeZoneOffset('');
    setError('');
    setShowHomeModal(false);
  };

  const handleTimeConversion = () => {
    if (!convertTime1 || !/^\d{1,2}:\d{2}$/.test(convertTime1)) {
      setError('Please enter a valid time in format HH:MM');
      return;
    }

    // Get the source time zone for conversion
    const fromTimeZone = selectedFromTimeZone === 'home' 
      ? homeTimeZone 
      : timeZones.find(tz => tz.id === selectedFromTimeZone);

    if (!fromTimeZone) {
      setError('Source time zone not found');
      return;
    }

    // Convert to all other time zones including home
    const results = [
      {
        timezone: homeTimeZone,
        time: convertTime(convertTime1, fromTimeZone.offsetValue, homeTimeZone.offsetValue)
      },
      ...timeZones.map(tz => ({
        timezone: tz,
        time: convertTime(convertTime1, fromTimeZone.offsetValue, tz.offsetValue)
      }))
    ];

    setConvertResults(results);
    setError('');
  };

  const formatTime = (date: Date, offsetHours: number) => {
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

  // Combine home time zone with other time zones for display, with home first
  const allTimeZones = [
    { ...homeTimeZone, isHome: true },
    ...timeZones
  ];

  return (
    <div className={`min-h-screen ${darkMode ? 'dark bg-gray-900' : 'bg-gray-100'} transition-colors duration-200`}>
      <div className="container mx-auto px-4 py-8 min-h-screen">
        <header className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            Positive Time Zone Converter
          </h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowConvertModal(true)}
              className={`${darkMode ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'} 
                text-white font-medium py-2 px-4 rounded-md flex items-center`}
              aria-label="Convert Time"
            >
              <Clock size={18} className="mr-1" />
            </button>
            <button
              onClick={() => setShowModal(true)}
              className={`${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} 
                text-white font-medium py-2 px-4 rounded-md flex items-center`}
              aria-label="Add Time Zone"
            >
              <Plus size={18} className="mr-1" />
            </button>
            <button
              onClick={() => setShowHomeModal(true)}
              className={`${darkMode ? 'bg-green-600 hover:bg-green-700' : 'bg-green-600 hover:bg-green-700'} 
                text-white font-medium py-2 px-4 rounded-md flex items-center`}
              aria-label="Set Home Time Zone"
            >
              <Settings size={18} className="mr-1" />
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
            Home Time: ({homeTimeZone.offset}): <span className="font-bold text-2xl">{formatTime(currentTime, homeTimeZone.offsetValue)}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {allTimeZones.length === 1 && timeZones.length === 0 ? (
            <div className={`col-span-full text-center py-16 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              <Clock size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-xl">No time zones added yet.</p>
              <p className="mt-2">Click the "Add Time Zone" button to get started.</p>
            </div>
          ) : (
            allTimeZones.map((tz) => (
              <div 
                key={tz.id} 
                className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} 
                  border rounded-lg p-5 transition-all duration-200 relative
                  ${tz.isHome ? 'bg-opacity-90' : ''}
                  hover:transform hover:scale-105 hover:shadow-lg`}
              >
                {deleteConfirmId === tz.id && !tz.isHome ? (
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
                
                {downloadConfirmId === tz.id ? (
                  <div className="absolute inset-0 bg-opacity-90 flex flex-col items-center justify-center p-4 rounded-lg z-10"
                    style={{ backgroundColor: darkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)' }}>
                    <p className={`text-center mb-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      This will download a .bat file that can change your Windows PC time to {tz.name} ({tz.offset}).
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDownloadBatFile(tz)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                      >
                        Download
                      </button>
                      <button
                        onClick={cancelDownload}
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
                    <h3 className={`font-medium text-xl ${darkMode ? 'text-white' : 'text-gray-800'} flex items-center`}>
                      {tz.name}
                      {tz.isHome && (
                        <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">HOME</span>
                      )}
                    </h3>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tz.offset}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => confirmDownload(tz.id)}
                      className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-500 hover:text-blue-700'} p-1`}
                      aria-label="Download time zone .bat file"
                    >
                      <Download size={18} />
                    </button>
                    {!tz.isHome && (
                      <button
                        onClick={() => confirmDelete(tz.id)}
                        className={`${darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-500 hover:text-red-700'} p-1`}
                        aria-label="Delete time zone"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className={`text-center py-4 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  <div className="text-3xl font-semibold mb-1">
                    {formatTime(currentTime, tz.offsetValue)}
                  </div>
                  {!tz.isHome && (
                    <div className={`flex items-center justify-center ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      <Clock size={16} className="mr-2" />
                      <span>{homeTimeZone.name}: <span className="font-bold">{formatTime(currentTime, homeTimeZone.offsetValue)}</span></span>
                    </div>
                  )}
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

        {/* Set Home Time Zone Modal */}
        {showHomeModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-md w-full`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Set Home Time Zone
                </h2>
                <button 
                  onClick={() => setShowHomeModal(false)}
                  className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="homeOffset" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                    Home Time Zone
                  </label>
                  <input
                    type="text"
                    id="homeOffset"
                    placeholder="e.g., UTC+1, GMT-5"
                    className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                      ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                    value={newTimeZoneOffset}
                    onChange={(e) => setNewTimeZoneOffset(e.target.value)}
                  />
                </div>
                
                {error && <p className="text-red-600 text-sm">{error}</p>}
                
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setShowHomeModal(false)}
                    className={`mr-2 px-4 py-2 rounded-md ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800'}`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSetHomeTimeZone}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-md flex items-center"
                  >
                    <Settings size={18} className="mr-1" /> Set Home
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Time Conversion Modal */}
        {showConvertModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-2xl w-full`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                  Convert Time
                </h2>
                <button 
                  onClick={() => {
                    setShowConvertModal(false);
                    setConvertResults([]);
                    setConvertTime1('');
                  }}
                  className={`p-1 rounded-full ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-200 text-gray-600'}`}
                >
                  <X size={20} />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-end gap-4">
                  <div className="flex-1">
                    <label htmlFor="fromTimeZone" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Convert from
                    </label>
                    <select
                      id="fromTimeZone"
                      className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'border-gray-300 text-gray-900'}`}
                      value={selectedFromTimeZone}
                      onChange={(e) => setSelectedFromTimeZone(e.target.value)}
                    >
                      <option value="home">{homeTimeZone.name} ({homeTimeZone.offset})</option>
                      {timeZones.map(tz => (
                        <option key={tz.id} value={tz.id}>{tz.name} ({tz.offset})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-1">
                    <label htmlFor="convertTime" className={`block text-sm font-medium mb-1 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                      Enter time (HH:MM)
                    </label>
                    <input
                      type="text"
                      id="convertTime"
                      placeholder="e.g., 14:30"
                      className={`w-full p-2 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                        ${darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'border-gray-300 text-gray-900'}`}
                      value={convertTime1}
                      onChange={(e) => setConvertTime1(e.target.value)}
                    />
                  </div>
                  
                  <button
                    onClick={handleTimeConversion}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-md flex items-center"
                  >
                    <ArrowRight size={18} className="mr-1" /> Convert
                  </button>
                </div>
                
                {error && <p className="text-red-600 text-sm">{error}</p>}
                
                {convertResults.length > 0 && (
                  <div className={`mt-6 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                    <h3 className="text-lg font-medium mb-3">Conversion Results</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {convertResults.map((result, index) => (
                        <div 
                          key={index}
                          className={`p-3 rounded-md ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} 
                            hover:transform hover:scale-105 transition-transform duration-200
                            ${result.timezone.id === 'home' ? 'bg-opacity-90' : ''}`}
                        >
                          <div className="font-medium flex items-center">
                            {result.timezone.name} ({result.timezone.offset})
                            {result.timezone.id === 'home' && (
                              <span className="ml-2 text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">HOME</span>
                            )}
                          </div>
                          <div className="text-xl font-bold">{result.time}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;