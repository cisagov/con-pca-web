import * as moment from 'node_modules/moment/moment';

/**
 * Returns a boolean indicating if two Date or Moment objects
 * contain the same date, not counting the time part.
 */
export function isSameDate(d1, d2) {
    const m1 = moment(d1);
    const m2 = moment(d2);

    return (m1.hours(0).minutes(0).seconds(0).milliseconds(0)
        === m2.hours(0).minutes(0).seconds(0).milliseconds(0));
}

/**
 * Returns a Moment for the specified Date or Moment
 * with hours, minutes, seconds and milliseconds zeroed out.
 */
export function dateOnly(d) {
    return moment(d).hours(0).minutes(0).seconds(0).milliseconds(0);
}

/**
 * Converts a string to Title Case.
 */
export function toTitleCase(str) {
    return str.replace(
        /\w\S*/g,
        (txt) => {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        }
    );
}

/**
 * Converts a quantity of seconds into human-readable pieces:
 * days, hours, minutes, seconds.
 */
export function humanTiming(seconds: number) {
    const tokens = [
        { s: 86400, label1: 'day', label: 'days' },
        { s: 3600, label1: 'hour', label: 'hours' },
        { s: 60, label1: 'minute', label: 'minutes' },
        { s: 1, label1: 'second', label: 'seconds' }
    ];

    let s = '';
    for (const token of tokens) {
        const numberOfUnits = Math.floor(seconds / token.s);
        seconds = seconds - token.s * numberOfUnits;
        if (numberOfUnits !== 0) {
            s += `${numberOfUnits} ${numberOfUnits === 1 ? token.label1 : token.label} `;
        }
    }

    return s;
}
