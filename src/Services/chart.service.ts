import { createCanvas } from "canvas";
import moment from "moment";
import ApiError from "../utils/apiError";

// Define Activity Data Type
interface ActivityData {
  date: string;
  activityCount: number;
}

const configuringMonth = () => {
  const currMonth = moment().month() + 1; // months are 0-indexed, so add 1
  const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return [...month.slice(currMonth), ...month.slice(0, currMonth)];
};

// Generate Activity Calendar
export const getActivityCalendar = async (
  activityData: ActivityData[],
  view: "monthly" | "yearly" = "yearly"
): Promise<{ image: Buffer; html: string }> => {
  try {
    const cellSize = 20; // Adjusted for better layout
    const padding = 5;
    const months = configuringMonth();

    let width, height;
    if (view === "yearly") {
      width = 53 * (cellSize + padding); // 53 weeks in a year
      height = 7 * (cellSize + padding) + 30; // 7 days per week + labels
    } else {
      width = 7 * (cellSize + padding) + 30; // 7 days per week
      height = 6 * (cellSize + padding) + 50; // Up to 6 weeks + labels
    }

    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Define colors dynamically
    const getColor = (count: number) =>
      count > 0 ? `rgba(0, 135, 158, ${Math.min(count / 10, 1)})` : "#FFF2DB"; // Green for activity, lighter gray for inactive days

    // Generate HTML structure for hover and date display
    let html = `<div style="display: flex; flex-wrap: wrap; width: ${width}px;">`;

    // Draw labels for yearly view
    if (view === "yearly") {
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      months.forEach((month, i) => {
        ctx.fillStyle = "#000";
        ctx.fillText(month, i * 4 * (cellSize + padding) + 10, 15);
      });
    }

    // Fill every day of the year or month, and then mark activity
    const allDaysInView = [];
    if (view === "yearly") {
      // Add every day of the year (up to 53 weeks x 7 days)
      for (let week = 0; week < 53; week++) {
        for (let day = 0; day < 7; day++) {
          allDaysInView.push({ week, day });
        }
      }
    } else {
      // Monthly view: Loop over all possible days of the month
      const daysInMonth = moment().daysInMonth(); // Get the number of days in the month
      for (let day = 1; day <= daysInMonth; day++) {
        const parsedDate = moment().date(day);
        const weekOfMonth = Math.floor((parsedDate.date() - 1) / 7);
        const dayOfWeek = parsedDate.day(); // Get day of the week (0-6)
        allDaysInView.push({ weekOfMonth, dayOfWeek });
      }
    }

    // Draw activity cells and generate HTML structure
    activityData.forEach(({ date, activityCount }) => {
      const parsedDate = moment(date); // Use moment.js to parse the date
      const dayOfWeek = parsedDate.day(); // Get day of the week (0-6)
      const weekOfYear = parsedDate.week() - 1; // Get the week of the year (starts from 0)

      let x, y;
      if (view === "yearly") {
        x = weekOfYear * (cellSize + padding);
        y = dayOfWeek * (cellSize + padding) + 30;
      } else {
        const weekOfMonth = Math.floor(parsedDate.date() / 7);
        x = dayOfWeek * (cellSize + padding);
        y = weekOfMonth * (cellSize + padding) + 30;
      }

      ctx.fillStyle = getColor(activityCount);
      ctx.fillRect(x, y, cellSize, cellSize);

      // Add HTML for each day
      html += `<div
                style="width: ${cellSize}px; height: ${cellSize}px; background-color: ${getColor(
        activityCount
      )}; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; 
      
      margin: ${padding}px; cursor: pointer;"
                title="${parsedDate.format("MMMM D, YYYY")}"
                data-date="${parsedDate.format("YYYY-MM-DD")}">
                ${parsedDate.date()}
              </div>`;
    });

    // Draw inactive days (gray color) and add HTML for them
    allDaysInView.forEach(({ week, day }) => {
      const activity = activityData.find(
        (item) =>
          moment(item.date).week() - 1 === week &&
          moment(item.date).day() === day
      );
      const x = week * (cellSize + padding);
      const y = day * (cellSize + padding) + 30;

      const color = activity ? getColor(activity.activityCount) : "#d3d3d3"; // Light gray for inactive days
      ctx.fillStyle = color;
      ctx.fillRect(x, y, cellSize, cellSize);

      // Add HTML for inactive days
      if (!activity) {
        html += `<div
                  style="width: ${cellSize}px; height: ${cellSize}px; background-color: ${color}; display: flex; align-items: center; justify-content: center; border: 1px solid #ddd; margin: ${padding}px; cursor: not-allowed;"
                  data-date="">
                  ${day}
                </div>`;
      }
    });

    // Close HTML structure
    html += `</div>`;

    return {
      image: canvas.toBuffer(),
      html,
    };
  } catch (error) {
    throw new ApiError(500, "Failed to generate activity calendar");
  }
};
