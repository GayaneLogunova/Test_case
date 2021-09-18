function createLessonToTeacherRealtion(lessonIds, teacherIds) {
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
};

module.exports = createLessonToTeacherRealtion;