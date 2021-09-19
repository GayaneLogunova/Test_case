const lessonsDAO = require('../dao/lessons');

class LessonsService {
    findNextDate(firstDate, days) {
        const firstDateWeekDay = new Date(firstDate).getDay();

        let index = 0;
        while (index < days.length && days[index] <= firstDateWeekDay) { index++ }

        const daysToAdd = days[index % days.length] > firstDateWeekDay
            ? days[index % days.length] - firstDateWeekDay
            : 6 - firstDateWeekDay + days[index % days.length] + 1

        return new Date(new Date(firstDate).setDate(new Date(firstDate).getDate() + daysToAdd));
    }

    getDifferenceInDays(firstDate, endDate) {
        return Math.ceil((new Date(endDate) - new Date(firstDate)) / (1000 * 60 * 60 * 24));
    }

    getUpperBound(firstDate, currentDate, days, lessonsCount, lastDate) {
        let upperBound = 0;

        if (lessonsCount) {
            let maxLessonsInYear = Math.floor(365 / 7) * days.length;
            maxLessonsInYear = days.includes(new Date(firstDate).getDay() + 1) ? maxLessonsInYear + 1 : maxLessonsInYear;

            upperBound = lessonsCount > 300 ? 300 : lessonsCount;
            console.log('maxLessonsInYear', maxLessonsInYear);
            upperBound = upperBound > maxLessonsInYear ? maxLessonsInYear : upperBound;
            return upperBound;
        } else {
            const diffInDays = this.getDifferenceInDays(firstDate, lastDate);
            const realDiffInDays = diffInDays > 366 ? 365 : diffInDays;
            upperBound = Math.floor(realDiffInDays / 7) * days.length;
            let daysLeft =  realDiffInDays % 7;
            let diff = this.getDifferenceInDays(firstDate, currentDate);
            let startDate = firstDate;
            let endDate = currentDate;
            while (daysLeft > diff) {
                console.log(1)
                upperBound++;
                daysLeft -= diff;
                startDate = endDate;
                endDate = this.findNextDate(startDate, days);
                diff = this.getDifferenceInDays(firstDate, endDate);
            }
            upperBound = upperBound > 300 ? 300 : upperBound;
            return upperBound;
        }
    }

    getLesson(date, title) { return { date: new Date(date), title, status: 0 } }

    async createLessons(lessonsDTO) {
        const firstDate = lessonsDTO.firstDate;
        const days = lessonsDTO.days.sort();
        let index = 0;
        let currentDate;
        
        if (days.includes(new Date(firstDate).getDay())) {
            currentDate = firstDate;
        } else {
            currentDate = this.findNextDate(firstDate, days);
        }

        if (!await lessonsDAO.checkIfAllTeachersExists(lessonsDTO.teacherIds)) {
            throw new Error('Some teachers not found');
        }

        let lessons = [];
        const upperBound = this.getUpperBound(firstDate, currentDate, days, lessonsDTO.lessonsCount, lessonsDTO.lastDate);
        console.log('upperBound', upperBound);
        while (index < upperBound) {
            lessons.push(this.getLesson(currentDate, lessonsDTO.title));
            currentDate = this.findNextDate(currentDate, days);
            index++;
        }

        return await lessonsDAO.createLessonsAndRelationToTeachers(lessons, upperBound, lessonsDTO.teacherIds);
    }


}

module.exports = new LessonsService();