import mongoose from "mongoose";
import UserSubmission from "../../models/submissions.model";
import { monthStreak, weekdays } from "./generateHtml";
import { getLast360DaysGroupedByMonthAndWeek } from "./utils";

const last360Callback = getLast360DaysGroupedByMonthAndWeek();

export const createStreak = async ({ isExtension = true, user_id }: any) => {
  console.log(">>> user_id", user_id);
  const last360days = last360Callback(360);

  let months = `<div style="display:flex; gap:2px">`;

  for (let month of last360days) {
    let data = await UserSubmission.aggregate([
      {
        $match: {
          user_id: new mongoose.Types.ObjectId(user_id),
        },
      },
      {
        $match: {
          createdAt: {
            $gte: new Date(month.weeks[0].weekStart),
            $lte: new Date(month.weeks[month.weeks.length - 1].weekEnd),
          },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);
    console.log(">> data", data);
    data = data.reduce((acc: any, doc: any) => {
      acc[doc._id] = doc.count;
      return acc;
    }, {});

    months += monthStreak(month, data);
  }

  months += "</div>";

  return `<div style="padding: 4px; display:flex; flex-direction: row;">
  ${weekdays()}
  ${months}
  </div>`;
};
