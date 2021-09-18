const db = require('../db/db');
const filterFunctions = require('./filter-functions');

class LessonsDAO {
    async createLessons(lessonsToCreate) {
        return db('lessons')
            .insert(lessonsToCreate.map(lesson => ({ ...lesson })))
            .returning('id')
    }

    async createLessonsToTeachers(lessonsToTeachersToCreate) {
        return db('lesson_teachers')
            .insert(lessonsToTeachersToCreate
            .map(lessonToTeacher => ({ ...lessonToTeacher })))
            .returning('lesson_id')
        
    }

    async filterLessons(filterParams) {
        let limit = 'ALL';
        let offset = 0;
        let selectedTeachers = [];

        if (filterParams.page) {
            limit = filterParams.lessonsPerPage || 5;
            offset = (filterParams.page - 1) * limit;
        }
        
        if (filterParams.teacherIds) {
            selectedTeachers = await db('lesson_teachers')
                .select('*')
                .whereIn('teacher_id', filterParams.teacherIds.split(','))
        }

        const countedStudents = await db('lesson_students')
            .select('lesson_id')
            .count('*')
            .groupBy('lesson_id')
        
        const filteredLessons = await db('lessons')
            .where((qb) => { filterFunctions.filterByDate(qb, filterParams.date) })
            .where((qb) => { filterFunctions.filterByStatus(qb, filterParams.status) })
            .where((qb) => { filterFunctions.filterByTeachers(qb, filterParams.teacherIds, selectedTeachers) }) 
            .where((qb) => { filterFunctions.filterByStudents(qb, filterParams.studentsCount, countedStudents) })
            .select('*')
            .orderBy('lessons.id', 'asc')
            .limit(limit)
            .offset(offset)
        
        return filteredLessons;
    }


    async filterTeachersByLessonIds(lessonIds) {
        const teachers = await db('lesson_teachers')
            .whereIn('lesson_id', lessonIds)
            .join('teachers', 'lesson_teachers.teacher_id', 'teachers.id')
            .select('*')

        return teachers;
    }

    async filterStudentsByLessonIds(lessonIds) {
        const students = await db('lesson_students')
            .whereIn('lesson_id', lessonIds)
            .join('students', 'lesson_students.student_id', 'students.id')
            .select('*')

        return students;
    }

    async checkIfAllTeachersExists(teacherIds) {
        const teachersCount = await db('teachers')
            .whereIn('id', teacherIds)
            .count('id')

        return teachersCount[0].count == teacherIds.length;
    }
}

module.exports = new LessonsDAO();