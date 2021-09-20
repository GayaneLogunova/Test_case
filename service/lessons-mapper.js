const { format } = require('date-fns');

class LessonsMapper {
    mapLessons(lessons, students, teachers) {
        return lessons.map(lesson => ({
            id: lesson.id,
            date: format(lesson.date, 'yyyy-MM-dd'),
            title: lesson.title,
            status: lesson.status,
            visitCount: students.filter(({ visit, lesson_id }) => visit && lesson_id === lesson.id).length,
            students: students.filter(({ lesson_id }) => lesson_id === lesson.id)
                .map(student => ({
                    id: student.student_id,
                    name: student.name,
                    visit: student.visit ? true : false,
                })),
            teachers: teachers.filter(({ lesson_id }) => lesson_id === lesson.id)
                .map(({ teacher_id, name }) => ({
                    id: teacher_id,
                    name,
                })),
        }));
    }
}

module.exports = new LessonsMapper();