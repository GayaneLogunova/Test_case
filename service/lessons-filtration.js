const lessonsDAO = require('../dao/lessons');
const lessonsMapper = require('./lessons-mapper');

class LessonsFiltrationService {
    async filterLessons(lessonsFilterParams) {
        console.log('lessonFilterParams', lessonsFilterParams);
        const lessons = await lessonsDAO.filterLessons(lessonsFilterParams);
        const lessonIds = lessons.map(({ id }) => id);

        console.log('lessonIds', lessonIds);
        const students = await lessonsDAO.filterStudentsByLessonIds(lessonIds);
        const teachers = await lessonsDAO.filterTeachersByLessonIds(lessonIds);
        
        return lessonsMapper.mapLessons(lessons, students, teachers);
    }
}

module.exports = new LessonsFiltrationService();