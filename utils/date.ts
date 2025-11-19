/**
 * Formats a date string or Date object into a readable format
 * Example: "12 September, 2025"
 */
export const formatDate = (date: string | Date | null | undefined): string => {
  if (!date) return "";

  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return "";
  }

  return dateObj.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
