class FilterFunctions {
    filterByDate(qb, date) {
        if (date && !date.includes(',')) {
            qb.where('lessons.date', date)
        } else if (date) {
            qb.whereBetween('lessons.date', date.split(','))
        }
    }

    filterByStatus(qb, status) {
        status !== undefined && qb.where('lessons.status', status)
    }

    filterByTeachers(qb, teacherIds) {
        teacherIds && qb.whereIn('lesson_teachers.teacher_id', teacherIds.split(','))
    }

    filterByStudents(qb, studentsCount, countedStudents) {
        let countedStudentIds = [];
        if (studentsCount && countedStudents.includes(',')) {
            countedStudentIds = countedStudents
                .filter(({ count }) => (count === studentsCount.toString())
                .map(({ lesson_id }) => lesson_id));
        } else if (studentsCount) {
            const min = studentsCount.toString().split(',')[0];
            const max = studentsCount.toString().split(',')[1];
            countedStudentIds = countedStudents
                .filter(({ count }) => (count >= min && count <= max))
                .map(({ lesson_id }) => lesson_id);
        }   

        studentsCount && qb.whereIn('lessons.id', countedStudentIds)
    }
}

module.exports = new FilterFunctions();