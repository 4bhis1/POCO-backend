import { createCanvas, CanvasRenderingContext2D } from "canvas";
import ApiError from "../utils/apiError";

// Define Activity Data Type
interface ActivityData {
  date: string;
  activityCount: number;
}

// Create Heatmap Image
export const getActivityCalendar = async (
  activityData: ActivityData[]
): Promise<Buffer> => {
  try {
    const width = 800;
    const height = 400;
    const cellSize = 50; // Cell size for each day
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);

    // Labels
    const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    labels.forEach((label, index) => {
      ctx.fillStyle = "#000";
      ctx.fillText(label, cellSize / 2 + index * cellSize, 20);
    });

    // Draw Heatmap
    const colors = (count: number) =>
      `rgba(0, 128, 0, ${Math.min(count / 10, 1)})`;
    activityData.forEach(({ date, activityCount }) => {
      const parsedDate = new Date(date);
      const dayOfWeek = parsedDate.getDay();
      const weekOfMonth = Math.floor((parsedDate.getDate() - 1) / 7);

      const x = dayOfWeek * cellSize;
      const y = weekOfMonth * cellSize + 40;

      ctx.fillStyle = colors(activityCount);
      ctx.fillRect(x, y, cellSize - 5, cellSize - 5);
    });

    // Return as Buffer
    return canvas.toBuffer();
  } catch (error) {
    throw new ApiError(500, "Failed to generate activity calendar");
  }
};
