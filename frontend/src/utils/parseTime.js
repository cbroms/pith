import * as dayjs from "dayjs";
import * as calendar from "dayjs/plugin/calendar";
import * as utc from "dayjs/plugin/utc";

dayjs.extend(calendar);
dayjs.extend(utc);

const parseTime = (time) => {
	const date = dayjs(time).local();

	const formattedDate = dayjs(date).calendar(null, {
		sameDay: "[Today at] h:mm a",
		lastDay: "[Yesterday at] h:mm a",
		lastWeek: "dddd [at] h:mm a",
		sameElse: "MM/D/YY [at] h:mm a",
	});

	return formattedDate;
};

export { parseTime };
