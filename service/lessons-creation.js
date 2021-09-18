const lessonsDAO = require('../dao/lessons');

class LessonsService {
    findNextDate(firstDate, days) {
        const firstDateWeekDay = new Date(firstDate).getDay();

        let index = 0;
        while (index < days.length && days[index] <= firstDateWeekDay) { index++ }

        return new Date(new Date(firstDate).setDate(new Date(firstDate).getDate() + days[index % days.length] - firstDateWeekDay));
    }

    getDifferenceInDays(firstDate, endDate) {
        return Math.ceil(new Date(endDate) - new Date(firstDate) / (1000 * 60 * 60 * 24));
    }

    getUpperBound(firstDate, currentDate, days, lessonsCount, lastDate) {
        let upperBound = 0;

        if (lessonsCount) {
            let maxLessonsInYear = Math.floor(365 / 7) * days.length;
            maxLessonsInYear = new Date(firstDate).getTime() === new Date(currentDate).getTime() ? maxLessonsInYear + 1 : maxLessonsInYear;

            upperBound = lessonsCount > 300 ? 300 : lessonsCount;
            upperBound = upperBound > maxLessonsInYear ? maxLessonsInYear : upperBound;
            return upperBound;
        } else {
            const diffInDays = this.getDifferenceInDays(firstDate, lastDate);
            const realDiffInDays = diffInDays > 365 ? 365 : diffInDays;
            upperBound = Math.floor(realDiffInDays / 7) * days.length;
            let daysLeft =  realDiffInDays % 7;
            let diff = this.getDifferenceInDays(firstDate, currentDate);
            let startDate = firstDate;
            let endDate = currentDate;
            while (daysLeft > diff) {
                upperBound++;
                daysLeft -= diff;
                startDate = endDate;
                endDate = this.findNextDate(startDate, days);
                diff = this.getDifferenceInDays(endDate, firstDate);
            }
            upperBound = upperBound > 300 ? 300 : upperBound;
            return upperBound;
        }
    }

    createLesson(date, title) { return { date, title, status: 0 } }

    async createLessons(lessonsDTO) {
        const firstDate = lessonsDTO.firstDate;
        const days = lessonsDTO.days.sort();
        let lessonIds = [];
        let index = 0;
        let currentDate;
        
        if (days.includes(new Date(firstDate).getDay())) {
            currentDate = firstDate;
        } else {
            currentDate = this.findNextDate(firstDate, days);
        }

        if (!await lessonsDAO.checkIfAllTeachersExists(lessonsDTO.teacherIds)) {
            return 'Some teachers not found';
        }

        let lessons = [];
        const upperBound = this.getUpperBound(firstDate, currentDate, days, lessonsDTO.lessonsCount, lessonsDTO.lastDate);

        while (index < upperBound) {
            lessons.push(this.createLesson(currentDate, lessonsDTO.title));
            currentDate = this.findNextDate(currentDate, days);
            index++;
        }

        const [id] = await lessonsDAO.createLessonsAndRelationToTeachers(lessons, upperBound, lessonsDTO.teacherIds);
        return lessonIds;
    }


}

module.exports = new LessonsService();