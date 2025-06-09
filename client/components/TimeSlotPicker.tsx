import React, { useState, useEffect } from 'react';
import { format, addDays, isSameDay } from 'date-fns';
import { getAvailableTimeSlots, hasDateBusySlots } from '../utils/dateTimeHelpers';

interface BusySlot {
  start: string;
  end: string;
  status: string;
}

interface TimeSlotPickerProps {
  selectedDate: Date;
  busySlots: BusySlot[];
  onTimeSelected: (dateTime: Date) => void;
  currentSelectedTime: Date | null;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  selectedDate,
  busySlots,
  onTimeSelected,
  currentSelectedTime
}) => {
  const [availableSlots, setAvailableSlots] = useState<Date[]>([]);
  
  useEffect(() => {
    const slots = getAvailableTimeSlots(selectedDate, busySlots);
    setAvailableSlots(slots);
  }, [selectedDate, busySlots]);
  
  const handleTimeClick = (time: Date) => {
    onTimeSelected(time);
  };
  
  const groupedSlots: { [hour: string]: Date[] } = {};
  availableSlots.forEach(slot => {
    const hour = format(slot, 'ha');
    if (!groupedSlots[hour]) {
      groupedSlots[hour] = [];
    }
    groupedSlots[hour].push(slot);
  });
  
  return (
    <div className="mt-4">
      <h3 className="text-sm font-medium mb-2">Available Times</h3>
      
      {Object.keys(groupedSlots).length > 0 ? (
        <div className="space-y-4">
          {Object.entries(groupedSlots).map(([hour, slots]) => (
            <div key={hour} className="space-y-1">
              <h4 className="text-xs font-semibold text-gray-500">{hour}</h4>
              <div className="grid grid-cols-4 gap-2">
                {slots.map((slot) => {
                  const isSelected = currentSelectedTime && 
                    isSameDay(slot, currentSelectedTime) && 
                    format(slot, 'HH:mm') === format(currentSelectedTime, 'HH:mm');
                  
                  return (
                    <button
                      key={slot.toISOString()}
                      onClick={() => handleTimeClick(slot)}
                      className={`
                        text-xs py-1 px-2 rounded-md border
                        ${isSelected 
                          ? 'bg-blue-500 text-white border-blue-600' 
                          : 'bg-white hover:bg-gray-50 border-gray-200'}
                      `}
                    >
                      {format(slot, 'h:mm a')}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500">No available time slots for this day.</p>
      )}
    </div>
  );
};

export default TimeSlotPicker;