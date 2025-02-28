export interface TimeZone {
  id: string;
  name: string;
  offset: string;
  offsetValue: number;
  windowsTimeZone?: string; // Windows time zone identifier for .bat file
  isHome?: boolean; // Flag to identify home time zone
}

// In a real application, this would be stored in a database or server
// For this example, we'll use localStorage to persist the data
const TIME_ZONES_KEY = 'timeZones';
const HOME_TIMEZONE_KEY = 'homeTimeZone';

// Windows time zone mapping (partial list of common time zones)
export const WINDOWS_TIMEZONES: Record<number, string> = {
  '-12': 'Dateline Standard Time',
  '-11': 'UTC-11',
  '-10': 'Hawaiian Standard Time',
  '-9': 'Alaskan Standard Time',
  '-8': 'Pacific Standard Time',
  '-7': 'Mountain Standard Time',
  '-6': 'Central Standard Time',
  '-5': 'Eastern Standard Time',
  '-4': 'Atlantic Standard Time',
  '-3': 'SA Eastern Standard Time',
  '-2': 'UTC-02',
  '-1': 'Azores Standard Time',
  '0': 'GMT Standard Time',
  '1': 'W. Central Africa Standard Time',
  '2': 'South Africa Standard Time',
  '3': 'Russian Standard Time',
  '4': 'Arabian Standard Time',
  '5': 'West Asia Standard Time',
  '6': 'Central Asia Standard Time',
  '7': 'SE Asia Standard Time',
  '8': 'China Standard Time',
  '9': 'Tokyo Standard Time',
  '10': 'AUS Eastern Standard Time',
  '11': 'Central Pacific Standard Time',
  '12': 'New Zealand Standard Time'
};

export const getTimeZones = (): TimeZone[] => {
  try {
    const storedTimeZones = localStorage.getItem(TIME_ZONES_KEY);
    const timeZones = storedTimeZones ? JSON.parse(storedTimeZones) : [];
    
    // Add Windows time zone identifiers if they don't exist
    return timeZones.map((tz: TimeZone) => {
      if (!tz.windowsTimeZone) {
        tz.windowsTimeZone = WINDOWS_TIMEZONES[tz.offsetValue.toString()] || 'GMT Standard Time';
      }
      return tz;
    });
  } catch (error) {
    console.error('Error loading time zones:', error);
    return [];
  }
};

export const addTimeZone = (timeZone: TimeZone): TimeZone[] => {
  try {
    // Add Windows time zone identifier
    if (!timeZone.windowsTimeZone) {
      timeZone.windowsTimeZone = WINDOWS_TIMEZONES[timeZone.offsetValue.toString()] || 'GMT Standard Time';
    }
    
    const timeZones = getTimeZones();
    const updatedTimeZones = [...timeZones, timeZone];
    localStorage.setItem(TIME_ZONES_KEY, JSON.stringify(updatedTimeZones));
    return updatedTimeZones;
  } catch (error) {
    console.error('Error adding time zone:', error);
    return getTimeZones();
  }
};

export const deleteTimeZone = (id: string): TimeZone[] => {
  try {
    const timeZones = getTimeZones();
    const updatedTimeZones = timeZones.filter(tz => tz.id !== id);
    localStorage.setItem(TIME_ZONES_KEY, JSON.stringify(updatedTimeZones));
    return updatedTimeZones;
  } catch (error) {
    console.error('Error deleting time zone:', error);
    return getTimeZones();
  }
};

export const getHomeTimeZone = (): TimeZone => {
  try {
    const storedHomeTimeZone = localStorage.getItem(HOME_TIMEZONE_KEY);
    if (storedHomeTimeZone) {
      return JSON.parse(storedHomeTimeZone);
    }
    // Default to Nigeria (GMT+1)
    return {
      id: 'home',
      name: 'HOME',
      offset: 'GMT+1',
      offsetValue: 1,
      windowsTimeZone: 'W. Central Africa Standard Time'
    };
  } catch (error) {
    console.error('Error loading home time zone:', error);
    return {
      id: 'home',
      name: 'HOME',
      offset: 'GMT+1',
      offsetValue: 1,
      windowsTimeZone: 'W. Central Africa Standard Time'
    };
  }
};

export const setHomeTimeZone = (timeZone: TimeZone): void => {
  try {
    localStorage.setItem(HOME_TIMEZONE_KEY, JSON.stringify(timeZone));
  } catch (error) {
    console.error('Error setting home time zone:', error);
  }
};

export const generateBatFileContent = (windowsTimeZone: string): string => {
  return `@echo off
powershell -Command "Start-Process cmd -ArgumentList '/c tzutil /s \\"${windowsTimeZone}\\"' -Verb runAs"`;
};

export const downloadBatFile = (timeZone: TimeZone): void => {
  const content = generateBatFileContent(timeZone.windowsTimeZone || 'GMT Standard Time');
  const blob = new Blob([content], { type: 'application/bat' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `set_timezone_${timeZone.name.replace(/\s+/g, '_')}.bat`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const convertTime = (
  inputTime: string, 
  fromOffsetValue: number, 
  toOffsetValue: number
): string => {
  // Parse the input time (format: HH:MM)
  const [hours, minutes] = inputTime.split(':').map(Number);
  
  // Create a date object with the current date but with the input time
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);
  date.setSeconds(0);
  
  // Convert to UTC
  const utcTime = date.getTime() - (date.getTimezoneOffset() * 60000) - (fromOffsetValue * 3600000);
  
  // Convert to target time zone
  const targetTime = new Date(utcTime + (toOffsetValue * 3600000));
  
  // Format the time
  return targetTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
};