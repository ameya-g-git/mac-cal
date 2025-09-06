function legendTimeToRecur(legTime, year) {
  const [days, time] = legTime.split(' : ').map((t) => t.trim());
  let begin, end;

  const dayArray = days.split(',').map((d) => d.trim().toUpperCase());

  // only the case if begin + end is included
  if (dayArray.length !== days.split(/\s+/).length) {
    const lastElem = dayArray[dayArray.length - 1];

    // if begin + end is included, lastElem looks something like 'THU MAY 5 - JUN 13'
    // the string is sliced to separate the dayArray elem from the dates
    const [elem, dates] = [lastElem.slice(0, 3), lastElem.slice(4)];
    dayArray[dayArray.length - 1] = elem;

    begin = new Date(`${dates.split(' - ')[0]} ${year}`);
    end = new Date(`${dates.split(' - ')[1]} ${year}`);
  }

  const times = time.split(/\s+to\s+/);

  return {
    freq: {
      days: dayArray.map((d) => d.slice(0, 2)),
      startTime: times[0],
      endTime: times[1],
    },
    ...(begin && end && { begin, end }),
  };
}

function parseRooms(roomElem, roomFreqLength) {
  if (roomElem.querySelector('.legend_multi_loc')) {
    // gets just the weekdays from each legend_multi_loc in a subarray per legend_multi_loc
    const byDays = roomElem.innerHTML
      .split('<br>')
      .slice(0, -1)
      .map((d) => d.split('<')[0].trim().split(':')[0].trim().split(', '));

    // gets just the separate rooms for each legend_multi_loc
    const byRooms = Array.from(
      roomElem.querySelectorAll('.legend_multi_loc'),
    ).map((r) => r.textContent.split('-')[1].trim().replace('_', ' '));

    const weekFormat = Array(5).fill(''); // we'll put the room into its corresponding slot in this list based in the day it occurs

    for (let i = 0; i < byDays.length; i++) {
      const days = byDays[i].map((d) => d.toUpperCase());

      for (const d of days) {
        switch (d) {
          case 'MON':
            weekFormat[0] = byRooms[i];
            break;
          case 'TUE':
            weekFormat[1] = byRooms[i];
            break;
          case 'WED':
            weekFormat[2] = byRooms[i];
            break;
          case 'THU':
            weekFormat[3] = byRooms[i];
            break;
          case 'FRI':
            weekFormat[4] = byRooms[i];
            break;

          default:
            break;
        }
      }
    }

    return weekFormat.filter((room) => room.length > 0);
  } else if (roomElem.textContent.length > 0) {
    return Array(roomFreqLength).fill(
      roomElem.textContent
        .split('-')[1]
        .replace(/\s+/, ' ')
        .trim()
        .replace('_', ' '),
    );
  }

  return [''];
}

export default function parse() {
  const courseBoxes = document.querySelectorAll(
    '#legend_box>.course_box .course_cell_legend',
  );

  if (courseBoxes.length === 0) throw new Error('No courses selected.');

  let data = {
    sem: '',
    classes: [],
  };

  for (const course of courseBoxes) {
    const header = course.querySelector('.header_cell');
    const courseTitle = header.querySelector('.course_title');

    const [sem, dates] = courseTitle.nextElementSibling.textContent
      .split(':')
      .map((s) => s.replace(/\s+/g, ' ').trim());

    let [begin, end] = dates // course start and end dates in the format `Month D YY 1:00 A.M.`
      .split(/\s+-\s+/)
      .map((d) => new Date(`${d} ${sem.slice(0, 4)}`));

    end = end.setDate(end.getDate() + 1);

    data.sem = sem.toLowerCase().replace('/', '');

    // array of the classes + sections being enrolled in, in order
    const selectedClasses = course.querySelector(
      '.inner_legend_table:has(.is-checked)',
    );

    // im Assuming courses only have 1 TUT timing section Please : )
    const classTimes = header
      .querySelector('#hoursInLegend') // evil how they use the same id per course
      .innerHTML.split('<br>')
      .slice(0, -1);

    // turns out the order of this isn't consistent
    // why
    // TUT is last all the time i Think
    const classOrder = Array.from(
      selectedClasses.querySelectorAll('strong.type_block'),
    ).map((elem) => elem.textContent.replace(/\s+/g, ' ').trim());

    const profOrder = Array.from(
      selectedClasses.querySelectorAll("[title*='Instructor']"),
    ).map((elem) => elem.textContent);

    // holds an array of class times, separated per class in a subarray
    // yes this is annoying enough to have to be done in a separate variable
    let classTimesOrder = [classTimes];

    // TODO: from what i've seen  only labs really have that issue regarding biweekly classes
    // so... if i see that   only give the lecture min(2, number of non-ranged dates) lines

    if (classOrder.length === 2) {
      if (classTimes.length === 1) {
        //  "Thu, Wed : 10:30 AM to 11:20 AM"
        const [days, times] = classTimes[0].split(' : ');

        // there's a nonzero chance that this mapping is actually Wrong
        // and that there's a case that 3 days show up in one line
        // i haven't seen what that would look like and how i should account for that
        // soooooooo
        classTimesOrder = [
          days
            .split(', ')
            .slice(0, -1)
            .map((d) => `${d} : ${times}`),
          days
            .split(', ')
            .slice(-1)
            .map((d) => `${d} : ${times}`),
        ];
      } else {
        const split =
          classOrder[0].includes('LEC') &&
          classTimes.length > 2 && // make sure there are enough classes to give LECs 2 lines
          !classTimes[1].includes('-') // usually, LECs aren't represented using date ranges
            ? 2
            : 1;

        classTimesOrder = [classTimes.slice(0, split), classTimes.slice(split)];
      }
    } else if (classOrder.length == 3) {
      const split1 =
        classOrder[0].includes('LEC') && classTimes.length > 3 ? 2 : 1;

      // TODO: what does this split2 mean, changed it to lab?? will see if this breaks anything
      const split2 =
        classOrder[1].includes('LAB') && classTimes.length - split1 > 2 ? 2 : 1;

      classTimesOrder = [
        classTimes.slice(0, split1),
        classTimes.slice(split1, split2),
        classTimes.slice(split2),
      ];
    }

    classTimesOrder = classTimesOrder.map((times) =>
      times.map((t) => {
        console.log(t);
        const [days, times] = t.split(' : ');

        console.log(days.split(', ').map((d) => `${d} : ${times}`));
        return days.split(', ').map((d) => `${d} : ${times}`);
      }),
    );

    const roomOrder = Array.from(
      selectedClasses.querySelectorAll('.location_block'),
    ).map((elem, i) =>
      classTimesOrder[i].map((t) => parseRooms(elem, t.length)),
    );

    console.log(courseTitle.textContent, classTimesOrder, roomOrder);

    classTimesOrder.forEach((times, i) => {
      const [classType, classSec] = classOrder[i].split(' ');
      const [year, _] = data.sem.split(' ');

      // TODO: i've fixed the legend_multi_loc parsing, im just running into the issue now where
      // a) i need the location to update properly, meaning i need to change up the parsing a bit
      //    (i figure i would need to instead use roomOrder[i].forEach(), since i need to push each separate location to data)
      //    yeah i think that's fine, i would have to give up some recurrence rules that make things neat but
      //    that's fine, it just needs to look good
      // that just needs me to update classTimesOrder honestly to separate by day

      times.forEach((t, ti) => {
        t.forEach((tblock, tbi) =>
          data.classes.push({
            begin: new Date(begin),
            end: new Date(end),
            name: courseTitle.textContent.trim(),
            classType,
            classSec,
            prof: profOrder[i],
            loc: roomOrder[i][ti][tbi], // every time has a corresponding room
            ...legendTimeToRecur(tblock, Number(year)),
            // legendTimeToRecur returns an object of type { freq: { ... }, begin?: Date, end?: Date }
          }),
        );
      });
    });
  }
  console.log(data);

  return data;
}
