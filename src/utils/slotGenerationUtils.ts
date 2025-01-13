import { format, parse, addMinutes } from "date-fns";
import { de } from "date-fns/locale";

interface GenerateTimeSlotsParams {
  startTime: string;
  endTime: string;
  slotDuration: number;
  bufferTime: number;
  date: string;
}

interface TimeSlot {
  start: string;
  end: string;
  formattedTime?: string;
}

export const generateTimeSlots = ({
  startTime,
  endTime,
  slotDuration,
  bufferTime,
  date,
}: GenerateTimeSlotsParams): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const baseDate = "2024-01-01"; // Use a fixed date for time calculations

  let currentTime = parse(startTime, "HH:mm", new Date(`${baseDate}T00:00:00`));
  const endTimeDate = parse(endTime, "HH:mm", new Date(`${baseDate}T00:00:00`));

  while (currentTime < endTimeDate) {
    const slotEnd = addMinutes(currentTime, slotDuration);
    
    // Check if the slot end time exceeds the end time
    if (slotEnd > endTimeDate) {
      break;
    }

    const slot = {
      start: format(currentTime, "HH:mm"),
      end: format(slotEnd, "HH:mm"),
      formattedTime: `${format(currentTime, "HH:mm")} - ${format(slotEnd, "HH:mm")}`,
    };

    slots.push(slot);

    // Add buffer time to the end time to calculate the next slot's start time
    currentTime = addMinutes(slotEnd, bufferTime);
  }

  return slots;
};