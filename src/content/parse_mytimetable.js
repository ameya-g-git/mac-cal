function legendTimeToRecur(legTime, year) {
  const [days, time] = legTime
    .split(/:\s+/)
    .map((t) => t.replace(/[\t\r\n\f\v]/g, ' ').trim());
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

function parseRooms(roomElem) {
  let rooms = [];

  if (roomElem.querySelector('.legend_multi_loc')) {
    rooms = Array.from(roomElem.querySelectorAll('.legend_multi_loc')).map(
      (r) =>
        r.textContent
          .split('-')[1]
          .replace(/\s+/, ' ')
          .trim()
          .replace('_', ' '),
    );
  } else if (roomElem.textContent.length > 0) {
    for (let i = 0; i < 3; i++) {
      // in case a particular classType has multiple timings but in the same room
      rooms.push(
        roomElem.textContent
          .split('-')[1]
          .replace(/\s+/, ' ')
          .trim()
          .replace('_', ' '),
      );
    }
  }

  return rooms.length > 0 ? rooms : ['', '', ''];
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

    const [begin, end] = dates // course start and end dates in the format `Month D YY`
      .split(/\s+-\s+/)
      .map((d) => new Date(`${d} ${sem.slice(0, 4)}`));

    data.sem = sem.toLowerCase().replace('/', '');

    // array of the classes + sections being enrolled in, in order
    const selectedClasses = course.querySelector(
      '.inner_legend_table:has(.is-checked)',
    );

    // goes in the order of LEC, LAB, TUT
    const classOrder = Array.from(
      selectedClasses.querySelectorAll('strong.type_block'),
    ).map((elem) => elem.textContent.replace(/\s+/g, ' ').trim());

    const roomOrder = Array.from(
      selectedClasses.querySelectorAll('.location_block'),
    ).map((elem) => parseRooms(elem));

    const profOrder = Array.from(
      selectedClasses.querySelectorAll("[title*='Instructor']"),
    ).map((elem) => elem.textContent);

    // im Assuming courses only have 1 TUT timing section Please : )
    const classTimes = header
      .querySelector('#hoursInLegend') // evil how they use the same id per course
      .innerHTML.split('<br>')
      .slice(0, -1);

    // holds an array of class times, separated per class in a subarray
    // yes this is annoying enough to have to be done in a separate variable
    let classTimesOrder = [classTimes];

    if (classOrder.length == 2) {
      classTimesOrder = [
        classTimes.length == 2 // LEC or LAB times can take up to 2 lines, this accounts for that
          ? [classTimes[0]]
          : classTimes.slice(0, 2),
        [classTimes[classTimes.length - 1]],
      ];
    } else if (classOrder.length == 3) {
      classTimesOrder = classTimes.map((cls) => [cls]);
    }

    classTimesOrder.forEach((times, i) => {
      const [classType, classSec] = classOrder[i].split(' ');
      const [year, _] = data.sem.split(' ');

      times.forEach((t, ti) =>
        data.classes.push({
          begin: new Date(begin),
          end: new Date(end),
          name: courseTitle.textContent.replace(/\s+/g, ' ').trim(),
          classType,
          classSec,
          prof: profOrder[i],
          loc: roomOrder[i][ti], // every time has a corresponding room
          ...legendTimeToRecur(t, Number(year)),
          // legendTimeToRecur returns an object of type { freq: { ... }, begin?: Date, end?: Date }
        }),
      );
    });
  }

  return data;
}
