export interface TimeZone {
  id: string;
  name: string;
  offset: string;
  offsetValue: number;
}

// In a real application, this would be stored in a database or server
// For this example, we'll use localStorage to persist the data
const TIME_ZONES_KEY = 'timeZones';

export const getTimeZones = (): TimeZone[] => {
  try {
    const storedTimeZones = localStorage.getItem(TIME_ZONES_KEY);
    return storedTimeZones ? JSON.parse(storedTimeZones) : [];
  } catch (error) {
    console.error('Error loading time zones:', error);
    return [];
  }
};

export const addTimeZone = (timeZone: TimeZone): TimeZone[] => {
  try {
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