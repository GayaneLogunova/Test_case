const db = require('../db/db');
const filterFunctions = require('./filter-functions');
const range = require('../service/tools');
const createLessonToTeacherRealtion = require('../service/lessons-teachers-relation-creation');

class LessonsDAO {
    async createLessonsAndRelationToTeachers(lessonsToCreate, quantity, teacherIds) {
        let lessonIds = [];
        await db.transaction(async (trx) => {
            const [id] = await trx('lessons')
                .insert(lessonsToCreate.map(lesson => ({ ...lesson })))
                .returning('id')
            lessonIds = range(id, quantity);
            const lessonsToTeachersRelation = createLessonToTeacherRealtion(lessonIds, teacherIds);

            await trx('lesson_teachers')
                .insert(lessonsToTeachersRelation
                .map(lessonToTeacherRelation => ({ ...lessonToTeacherRelation })))
        })
        return lessonIds;
    }

    async getLessonsAndRelationToTeachers(lessonIds) {
        return db('lessons')
            .join('lesson_teachers', 'lessons.id', 'lesson_teachers.lesson_id')
            .whereIn('lessons.id', lessonIds)
            .select('*')

            // .select('lessons.title', 'lessons.date', 'lessons.status', 'lesson_teachers.teacher_id')
    }


    async filterLessons(filterParams) {
        console.log('filter params 2', filterParams);
        let limit = 'ALL';
        let offset = 0;
        let selectedTeachers = [];

        if (filterParams.page) {
            limit = filterParams.lessonsPerPage;
            offset = (filterParams.page - 1) * limit;
        }
        
        console.log('page accepted');

        if (filterParams.teacherIds) {
            selectedTeachers = await db('lesson_teachers')
                .select('*')
                .whereIn('teacher_id', filterParams.teacherIds.split(','))
        }

        console.log('teachers accepted');
        
        const countedStudents = await db('lesson_students')
            .select('lesson_id')
            .count('*')
            .groupBy('lesson_id')
        
        console.log('filterLEsosns');
        const filteredLessons = await db('lessons')
            .where((qb) => { filterFunctions.filterByDate(qb, filterParams.date) })
            .where((qb) => { filterFunctions.filterByStatus(qb, filterParams.status) })
            .where((qb) => { filterFunctions.filterByTeachers(qb, filterParams.teacherIds, selectedTeachers) }) 
            .where((qb) => { filterFunctions.filterByStudents(qb, filterParams.studentsCount, countedStudents) })
            .groupBy('lessons.id')
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