const db = require('../db/db');
const filterFunctions = require('./filter-functions');
const range = require('../service/tools');
const createLessonToTeacherRealtion = require('../service/lessons-teachers-relation-creation');
const { default: knex } = require('knex');

class LessonsDAO {
    async createLessonsAndRelationToTeachers(lessonsToCreate, quantity, teacherIds) {
        let [id];
        await db.transaction(async (trx) => {
            [id] = trx('lessons')
                .insert(lessonsToCreate.map(lesson => ({ ...lesson })))
                .returning('id')

            const lessonIds = range(id - quantity + 1, quantity);
            const lessonsToTeachersRelation = createLessonToTeacherRealtion(lessonIds, teacherIds);

            await trx('lesson_teachers')
                .insert(lessonsToTeachersRelation
                .map(lessonToTeacherRelation => ({ ...lessonToTeacherRelation })))
        })
        return id;
    }


    async filterLessons(filterParams) {
        let limit = 'ALL';
        let offset = 0;

        if (filterParams.page) {
            limit = filterParams.lessonsPerPage || 5;
            offset = (filterParams.page - 1) * limit;
        }
        
        const countedStudents = await db('lesson_students')
            .select('lesson_id')
            .count('*')
            .groupBy('lesson_id')
        
        const filteredLessons = await db('lessons')
            .join('lesson_teachers', 'lessons.id', 'lesson_teachers.lesson_id')
            .where((qb) => { filterFunctions.filterByDate(qb, filterParams.date) })
            .where((qb) => { filterFunctions.filterByStatus(qb, filterParams.status) })
            .where((qb) => { filterFunctions.filterByTeachers(qb, filterParams.teacherIds) }) 
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