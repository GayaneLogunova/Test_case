const lessonsDAO = require('../dao/lessons');
const lessonsMapper = require('./lessons-mapper');

class LessonsService {
    findNextDate(firstDate, days) {
        const firstDateWeekDay = new Date(firstDate).getDay();

        let index = 0;
        while (index < days.length && days[index] <= firstDateWeekDay) { index++ }

        return new Date(new Date(firstDate).setDate(new Date(firstDate).getDate() + days[index % days.length] - firstDateWeekDay));
    }

    countDifferenceInDays(firstDate, endDate) {
        return Math.ceil(new Date(endDate) - new Date(firstDate) / (1000 * 60 * 60 * 24));
    }

    countUpperBound(firstDate, currentDate, days, lessonsCount, lastDate) {
        let upperBound = 0;

        if (lessonsCount) {
            let maxLessonsInYear = Math.floor(365 / 7) * days.length;
            maxLessonsInYear = new Date(firstDate).getTime() === new Date(currentDate).getTime() ? maxLessonsInYear + 1 : maxLessonsInYear;

            upperBound = lessonsCount > 300 ? 300 : lessonsCount;
            upperBound = upperBound > maxLessonsInYear ? maxLessonsInYear : upperBound;
            return upperBound;
        } else {
            const diffInDays = this.countDifferenceInDays(firstDate, lastDate);
            const realDiffInDays = diffInDays > 365 ? 365 : diffInDays;
            upperBound = Math.floor(realDiffInDays / 7) * days.length;
            let daysLeft =  realDiffInDays % 7;
            let diff = this.countDifferenceInDays(firstDate, currentDate);
            let startDate = firstDate;
            let endDate = currentDate;
            while (daysLeft > diff) {
                upperBound++;
                daysLeft -= diff;
                startDate = endDate;
                endDate = this.findNextDate(startDate, days);
                diff = this.countDifferenceInDays(endDate, firstDate);
            }
            upperBound = upperBound > 300 ? 300 : upperBound;
            return upperBound;
        }
    }

    createLesson(date, title) { return { date, title, status: 0 } }

    createLessonToTeacherRealtion(lessonIds, teacherIds) {
        let lessonToTeacherRelation = [];
        for (const lessonId of lessonIds) {
            for (const teacherId of teacherIds) {
                lessonToTeacherRelation.push({
                    lesson_id: lessonId,
                    teacher_id: teacherId,
                });
            }
        }

        return lessonToTeacherRelation;
    }

    range(start, count) {
        let i = start;
        let arr = [];
        while (i - start < count) { arr.push(i++) }

        return arr;
    }

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
        const upperBound = this.countUpperBound(firstDate, currentDate, days, lessonsDTO.lessonsCount, lessonsDTO.lastDate);

        while (index < upperBound) {
            lessons.push(this.createLesson(currentDate, lessonsDTO.title));
            currentDate = this.findNextDate(currentDate, days);
            index++;
        }

        const [id] = await lessonsDAO.createLessons(lessons);
        lessonIds = this.range(id - upperBound + 1, upperBound);
        await lessonsDAO.createLessonsToTeachers(this.createLessonToTeacherRealtion(lessonIds, lessonsDTO.teacherIds));
        return lessonIds;
    }

    async filterLessons(lessonsFilterParams) {
        const lessons = await lessonsDAO.filterLessons(lessonsFilterParams);
        const lessonIds = lessons.map(({ id }) => id);

        const students = await lessonsDAO.filterStudentsByLessonIds(lessonIds);
        const teachers = await lessonsDAO.filterTeachersByLessonIds(lessonIds);
        
        return lessonsMapper.mapLessons(lessons, students, teachers);
    }
}

module.exports = new LessonsService();