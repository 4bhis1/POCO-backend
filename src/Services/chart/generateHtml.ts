function text(value: string) {
  return `<div style="font-size: 12px">${value}</div>`;
}

function box({
  size = 10,
  color = "green",
  title = "",
  className,
}: {
  size?: number;
  color: string;
  title: string;
  className: string;
}) {
  const defaultStyles = `
        height: ${size}px;
        width: ${size}px;
        background-color: ${color};
        border-radius: 1px;
        border-width: 1px;
        border-style: solid;
        cursor: pointer;
        ${className}
    `;

  return `<div style="${defaultStyles}" title="${title}"></div>`;
}

export function weekdays() {
  const weekDaysConst = ["Sun", "Tue", "Thu", "Sat"];
  return `
        <div style="
            margin-top: 20px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            margin-right: 10px;">
            ${weekDaysConst.map((day) => text(day)).join("")}
        </div>
    `;
}

function weekHtml({ week, data }: { week: any; data: any }) {
  const weekLength = week.length;
  let newWeeks = week;

  if (weekLength < 7) {
    if (week[0]?.weekDay === "Sun") {
      newWeeks = [...week, ...Array(7 - weekLength).fill(null)];
    } else {
      newWeeks = [...Array(7 - weekLength).fill(null), ...week];
    }
  }

  const weekHTML = newWeeks
    .map((doc: any) => {
      let color = "transparent";

      const count = data[doc?.date] || 0;
      if (doc && data[doc?.date]) {
        color = `rgba(61,185,117,${Math.min((count * 2) / 10, 1)})`;
      }
      return box({
        color: doc ? color : "transparent",
        className: `border-color :${doc ? "#ebedf0" : "transparent"};`,
        title: count ? `Solved : ${count} ` : "" + (`${doc?.date}` || ""),
      });
    })
    .join("");

  return `<div style="display: flex; flex-direction: column; gap: 2px;">${weekHTML}</div>`;
}

export const monthStreak = (month: any, data: any) => {
  const weeksHTML = month.weeks
    .map((week: any) => weekHtml({ week: week.days, data }))
    .join("");

  return `
<div style="display: flex; flex-direction: column; gap: 4px;">
    <div style="display: flex; flex: 1; justify-content: center;">
        ${text(month.name)}
    </div>
    <div style="display: flex; flex-direction: row; gap: 2px;">
        ${weeksHTML}
    </div>
</div>
`;
};
