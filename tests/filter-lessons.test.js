const axios = require('axios');
const db = require("../db/db");
const { format } = require("date-fns");

async function filterLessons(){
    var clientServerOptions = {
        url: 'http://localhost:3000/',
        data: {},
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
    }
    var body = "";
    var code = 200;  
    await axios(clientServerOptions)
        .then(function (response) {
            body = response.data
            code = response.status
        })
        .catch(function (error) {
            body = error.response.data
            code = error.response.status
        });
   
  
    return { body, code };
}

async function getLessons() {
    const lessons = await db('lessons').select('*')    
    const teachers = await db('teachers').select('*');
    const students = await db('students').select('*');
    const lesson_teachers = await db('lesson_teachers').select('*');
    const lesson_students = await db('lesson_students').select('*');

    return { lessons, teachers, students, lesson_teachers, lesson_students };
}

function filterByDate(lesson, date) {
    if (!date.includes(',')) {
        return format(new Date(date), 'yyyy-MM-dd') === format(lesson.date, 'yyyy-MM-dd');
    }
    return format(new Date(date.split(',')[0]), 'yyyy-MM-dd') <= format(lesson.date, 'yyyy-MM-dd')
        && format(new Date(date.split(',')[1]), 'yyyy-MM-dd') >= format(lesson.date, 'yyyy-MM-dd');
}


function filterByStudents(lesson, studentsCount, countedStudents) {
    let selectedLessonIds = [];
    if (!studentsCount.includes(',')) {
        for (const key in countedStudents) {
            if (countedStudents[key].toString() === studentsCount && !selectedLessonIds.includes(key)) {
                selectedLessonIds.push(key);
            }
        }
    } else {
        const min = studentsCount.toString().split(',')[0];
        const max = studentsCount.toString().split(',')[1];
        for (const key in countedStudents) {
            if (countedStudents[key] >= min && countedStudents[key] <= max) {
                selectedLessonIds.push(key);
            }
        }
    }   

    return selectedLessonIds.includes(lesson.id.toString());
}

async function filterLessons(lessons, teachers, students, lesson_teachers, lesson_students) {
    const date = "2019-09-02,2019-09-06";
    const status = 0;
    const teacherIds = "1,2";
    const studentsCount = "1,2";
    const page = 1;
    const lessonsPerPage = 2;

    let filteredLessons = [];
    let selectedLessonsIds = [];
    let countedStudents = {};

    for (const lessonToTeacherRelation of lesson_teachers) {
        if (teacherIds.split(',').includes(lessonToTeacherRelation.teacher_id.toString()) && !selectedLessonsIds.includes(lessonToTeacherRelation.lesson_id)) {
            selectedLessonsIds.push(lessonToTeacherRelation.lesson_id);
        }
    }

    for (const lessonToTeacherRelation of lesson_teachers) {
        if (!countedStudents[lessonToTeacherRelation.lesson_id]) {
            countedStudents[lessonToTeacherRelation.lesson_id] = 0;
        }
        countedStudents[lessonToTeacherRelation.lesson_id] += 1;
    }


    for (const lesson of lessons) {
        if (
            filterByDate(lesson, date)
            && lesson.status == status
            && selectedLessonsIds.includes(lesson.id)
            && filterByStudents(lesson, studentsCount, countedStudents)
        ) {
            filteredLessons.push(lesson);
        }
    }

    filteredLessons = filteredLessons.sort(function(first, second) { return first.id > second.id });
    filteredLessons.slice((page - 1) * lessonsPerPage, page * lessonsPerPage);
    
    console.log('filteredLessons', filteredLessons);
    return filteredLessons;
        
}

getLessons().then(({ lessons, teachers, students, lesson_teachers, lesson_students }) => filterLessons(lessons, teachers, students, lesson_teachers, lesson_students));


// test('filter lessons', async () => {
//     const data = await getLessons();
//     console.log('lessonsWithRelations', data.lessons);
//     const correctResponse = filterLessons(...data);
//     console.log('correctResponse', correctResponse);
//     // const { body } = await filterLessons();
//     console.log('body', body);
//     expect(body).toBe([{d}]);
// });