import moment from "moment";

const calculate = (days = 360) => {
  const today: any = moment();
  const startDate = today.clone().subtract(days, "days"); // 360 days ago

  let currentDate = startDate.clone();
  const monthsData = [];

  // Loop through each day, grouping by month and week
  while (currentDate.isBefore(today + 1)) {
    const monthStart = currentDate.clone().startOf("month");

    // Check if month data already exists, if not create a new entry
    let currentMonth: any = monthsData.find(
      (month) => month.month === monthStart.format("YYYY-MM")
    );
    if (!currentMonth) {
      currentMonth = {
        month: monthStart.format("YYYY-MM"),
        name: monthStart.format("MMM"),
        title: monthStart.format("MMM-YYYY"),
        start: monthStart,
        weeks: [],
      };
      monthsData.push(currentMonth);
    }

    // Group by week
    const weekStart = currentDate.clone().startOf("week"); // Start of the week (Sunday by default)
    const weekEnd = currentDate.clone().endOf("week"); // End of the week

    // Check if week data already exists in the month, if not create a new entry
    let currentWeek = currentMonth.weeks.find(
      (week: any) =>
        week.weekStart.isSame(weekStart, "day") &&
        week.weekEnd.isSame(weekEnd, "day")
    );

    if (!currentWeek) {
      currentWeek = {
        weekStart: weekStart.clone(),
        weekEnd: weekEnd.clone(),
        days: [],
      };
      currentMonth.weeks.push(currentWeek);
    }

    // Add the current day to the appropriate week
    currentWeek.days.push({
      date: currentDate.format("YYYY-MM-DD"),
      weekDay: currentDate.format("ddd"),
    });

    // Move to the next day
    currentDate.add(1, "days");
  }

  return monthsData;
};

export function getLast360DaysGroupedByMonthAndWeek() {
  let data: any = {};
  return (days: number = 365) => {
    const currDate = new Date().toDateString();
    if (!data[`${days}-${currDate}`]) {
      data[`${days}-${currDate}`] = calculate(days);
    }
    return data[`${days}-${currDate}`];
  };
}
