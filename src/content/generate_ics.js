import parse from "./parse_mytimetable.js";
import { ics } from "./ics.js";
import getFallDates from "./date_utils/generate_fall_dates.js";
import getSpringSummerDates from "./date_utils/generate_springsummer_dates.js";
import getWinterDates from "./date_utils/generate_winter_dates.js";

function getDayDelta(date, day) {
  const weekday = date.getDay();
  let dayOffset = 0;

  switch (day) {
    case "MO":
      dayOffset = 1;
      break;
    case "TU":
      dayOffset = 2;
      break;
    case "WE":
      dayOffset = 3;
      break;
    case "TH":
      dayOffset = 4;
      break;
    case "FR":
      dayOffset = 5;
      break;
    case "SA":
      dayOffset = 6;
      break;
    default:
      break;
  }

  return dayOffset - weekday;
}

function calcNewStartDate(begin, days) {
  let dayDelta = -1;

  // determine the delta between when the course starts, and when the actual first class is
  // goes through every weekday in days, in case first class falls Behind the course start date
  for (let i = 0; i < days.length && dayDelta < 0; i++) {
    dayDelta = getDayDelta(begin, days[i]);
  }

  // if every day in days results in a negative offset,
  // just set the first class date to be the first repeated day in the following week
  if (dayDelta < 0) {
    dayDelta = 7 + getDayDelta(begin, days[0]);
  }

  return begin.getDate() + dayDelta;
}

// async function loadScript(src) {
//     const parseSrc = await chrome.runtime.getURL(src);
//     const parseScript = await import(parseSrc);
//     return parseScript;
// }

function parseFormat(format, classData) {
  let output = [];
  let specCode = "";
  let specifier = false; // whether or not we're currently parsing a specifier

  const { name, classType, classSec, loc } = classData;

  for (const char of format) {
    specifier ? (specCode += char) : output.push(char);
    if (char === "{") {
      output.pop();
      if (output[output.length - 1] === "\\") {
        output.pop();
        output.push("{");
        continue;
      }
      specifier = true;
    }

    if (char === "}") {
      specifier = false;
      specCode = specCode.slice(0, -1);

      if (!specCode) continue;

      switch (specCode) {
        case "code":
          output.push(name);
          break;
        case "type":
          output.push(classType);
          break;
        case "sec":
          output.push(classSec);
          break;
        case "room":
          output.push(loc);
          break;
        default:
          output.push(`{${specCode}}`);
      }
      specCode = "";
    }
  }

  if (specifier) throw new SyntaxError("Curly brace not closed.");

  const outputStr = output.join("");

  return outputStr;
}

export function generateICS(nameFormat, includeLoc) {
  // * parse mytimetable
  const data = parse();

  // * create ics instance
  const { sem, classes } = data;
  const [year, season] = sem.split(" ");

  const uid = `maccal${sem.replace(" ", "")}`;
  const cal = ics(uid);
  // * calculate sessional dates

  let d;

  if (season.includes("fall")) {
    d = getFallDates(Number(year));
  } else if (season.includes("summer")) {
    d = getSpringSummerDates(Number(year));
  } else if (season.includes("winter")) {
    d = getWinterDates(Number(year));
  } else {
    throw new Error("Semester not specified.");
  }

  // * generate ics

  for (const cls of classes) {
    /* 
        example of the data stored in a single `cls`, for ease of development
        {
            "begin": "2025-05-05T04:00:00.000Z", (Date)
            "end": "2025-06-13T04:00:00.000Z",  (Date)
            "name": "MEDIAART 1A03",
            "classType": "LEC",
            "classSec": "C01",
            "prof": "Jessica Rodriguez Cabrera",
            "loc": "LRW 1055",
            "freq": {
                "days": ["TU", "TH"],
                "startTime": "1:00 PM",
                "endTime": "4:00 PM"
            }
        }
    */
    const { begin, end, name, classType, classSec, prof, loc, freq } = cls;

    begin.setDate(begin.getDate() - 1); // subtract 1 day so that school begins after every date in `dates`
    end.setDate(end.getDate() + 1); // calendar event excludes the last day, so just add one to account for that

    const dates = [...d];

    dates.push(begin);
    dates.push(end);

    dates.sort((d1, d2) => d1.getTime() - d2.getTime());

    // remove dates before the actual class start date
    dates.splice(
      0,
      dates.findIndex((d) => d.getTime() === begin.getTime()),
    );

    for (let i = 0; i < dates.length - 1; i++) {
      const secBegin = new Date(dates[i]);
      secBegin.setDate(secBegin.getDate() + 1); // class begins the day after a no school day

      const secEnd = new Date(dates[i + 1]);

      // if the date in question is just during a reading week, just skip to the next date
      if (secBegin.getTime() === secEnd.getTime()) continue;

      // once the date in question is the class end date, end the loop (only really applicable for spring/summer)
      if (dates[i].getTime() === end.getTime()) break;

      const { days, startTime, endTime } = freq;

      let eventName = `${name} - ${classType} ${classSec}`;
      try {
        eventName = parseFormat(nameFormat, {
          name,
          classType,
          classSec,
          loc,
        });
      } catch {
        console.error("Error in event name. Reverting to default name format.");
        eventName = `${name} - ${classType} ${classSec}`;
      }

      let clsBegin = new Date(secBegin);
      clsBegin.setDate(calcNewStartDate(clsBegin, days));

      const rrule = {
        freq: "WEEKLY",
        byday: days,
        until: secEnd,
      };

      cal.addEvent(
        eventName,
        "",
        includeLoc ? loc : "",
        `${clsBegin.toDateString()} ${startTime}`,
        `${clsBegin.toDateString()} ${endTime}`,
        rrule,
      );
    }
  }

  cal.download("maccal_" + sem.replace(" ", ""));
}
