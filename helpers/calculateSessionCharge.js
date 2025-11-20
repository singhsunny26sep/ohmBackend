/**
 * Calculates session charge based on time of day.
 * Daytime: 10:00 AM – 10:00 PM (40%)
 * Nighttime: 10:00 PM – 10:00 AM (50%)
 *
 * @param {Date} startTime - Session start time
 * @param {number} planPrice - Original plan price
 * @param {number} dayEarnPercentage - astrologer day time earn percentage
 * @param {number} nightEarnPercentage - astrologer night time earn percentage
 * @returns {{ isDay: boolean, totalCharge: number }}
 */
exports.calculateSessionCharge = (
  startTime,
  planPrice,
  dayEarnPercentage,
  nightEarnPercentage
) => {
  if (!startTime || !(startTime instanceof Date)) {
    throw new Error("Invalid startTime: must be a Date object");
  }
  if (typeof planPrice !== "number" || planPrice < 0) {
    throw new Error("Invalid planPrice: must be a positive number");
  }
  const hours = startTime.getHours();
  const minutes = startTime.getMinutes();
  const startHour = 10; // 10 AM
  const endHour = 22; // 10 PM
  let isDay;
  if (hours > startHour && hours < endHour) {
    isDay = true;
  } else if (hours === startHour && minutes >= 0) {
    isDay = true;
  } else if (hours === endHour && minutes === 0) {
    isDay = true;
  } else {
    isDay = false;
  }
  const totalCharge = isDay
    ? planPrice * (dayEarnPercentage / 100)
    : planPrice * (nightEarnPercentage / 100);
  return { isDay, totalCharge };
};
