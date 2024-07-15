export const getBusinessDates = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const day = currentDate.getDay();
    if (day !== 0 && day !== 6) {
      dates.push(currentDate);
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dates;
};
