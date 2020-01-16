const moment = require('moment');

module.exports = {
    nextWeekday: function(day, weekday) {
        const current = day.day();
        const days = (7 + weekday - current) % 7;
        return Number(day.clone().add(days, 'd'));
    },
    hoursToMinutes: function(m, h) {
        if (!m) {
            return moment.duration(h, 'hours').asMinutes();
        } else if (!h) {
            return m;
        }
        return moment.duration(h, 'hours').asMinutes() + m;

    },
    minutesToHoursMinutes: function(m) {
        let hours = Math.floor(m / 60);
        let minutes = m % 60;
        if(!minutes) return { h: hours };
        return {
          h: hours,
          m: minutes
        };
    },
    getDayOfWeek: function(dateToCheck) {
        return moment(dateToCheck).format('dddd');
    },
    sortDays: function(arr) {
    	const order = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    	return arr.sort((a, b) => order.indexOf(a) - order.indexOf(b));
    }
}