const axios = require('axios');
const lessonsDAO = require('../dao/lessons');
const range = require('../service/tools');
const lessonsCreation = require('../service/lessons-creation');
const { format } = require('date-fns');
const db = require("../db/db");

async function createLessons(lessonsDTO){
  var clientServerOptions = {
      url: 'http://localhost:3000/lessons',
      data: JSON.stringify(lessonsDTO),
      method: 'POST',
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



async function getLessons(lessonIds){
  const lessons = await db('lessons')
    .join('lesson_teachers', 'lessons.id', 'lesson_teachers.lesson_id')
    .whereIn('lessons.id', lessonIds)
    .select("*")

  return lessons.map(lesson => ({ title: lesson.title, date: format(lesson.date, 'yyyy-MM-dd'), status: lesson.status, teacherId: lesson.teacher_id }));
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

function getRandomTeacherIds() {
  const existingTeacherIds = [1, 2, 3, 4];
  let selectedTeachersQuantity = getRandomInt(4) + 1;
  let teacherIds = [];
  while (selectedTeachersQuantity > 0) {
    let teacherId = existingTeacherIds[getRandomInt(4)];
    while (teacherIds.includes(teacherId)) {
      teacherId = existingTeacherIds[getRandomInt(4)];
    }
    teacherIds.push(teacherId);
    selectedTeachersQuantity--;
  }
  return teacherIds.sort();
}

function getRandomWeekDays() {
  const weekDays = [];
  let quantityOfLessonsInWeek = getRandomInt(7) + 1;
  while (quantityOfLessonsInWeek > 0) {
    let weekDay = getRandomInt(7);
    while (weekDays.includes(weekDay)) {
      weekDay = getRandomInt(7);
    }
    weekDays.push(weekDay);
    quantityOfLessonsInWeek--;
  }
  return weekDays.sort();
}

function generateValidLessonsDTO() {
  const teacherIds = [3]; //getRandomTeacherIds();
  const days = [1]; //getRandomWeekDays();
  const firstDate = "2019-09-01";

  let validResponse = [];
  const amountOfLessons = 53;
  // const amountOfLessons = getRandomInt(300) + 1;

  let index = 1;
  let date = days.includes(new Date(firstDate).getDay()) ? firstDate : lessonsCreation.findNextDate(firstDate, days);
  while (amountOfLessons >= index) {
    for (const teacherId of teacherIds) {
      validResponse.push({ title: "Blue ocean", date: format(new Date(date), 'yyyy-MM-dd'), status: 0, teacherId });
    }
    index++;
    const nextDate = lessonsCreation.findNextDate(date, days);
    if (lessonsCreation.getDifferenceInDays(firstDate, nextDate) > 366) {
      break;
    }
    date = amountOfLessons >= index ? lessonsCreation.findNextDate(date, days) : date;
  }

  // if (getRandomInt(2) === 0) {
    return {
      lessonsDTO: { teacherIds, title: "Blue ocean", days, firstDate: "2019-09-01", lessonsCount: index - 1 },
      validResponse,
    };
  // }

  return {
    lessonsDTO: { teacherIds, title: "Blue ocean", days, firstDate: "2019-09-01", lastDate: format(new Date(date), 'yyyy-MM-dd') },
    validResponse,
  };

}

// test('test incorrect lessons dto 1', async () => {
//   const lessonsDTO = {teacherIds: [1, 2], title: "Blue ocean", days: [1], firstDate: "2019-09-01", lessonsCount: 2, lastDate: "2019-09-07"}
//   const { body } = await createLessons(lessonsDTO);
//   expect(body).toBe("LessonsCount and lastDate can`t be given together");
// });

// test('test incorrect lessons dto 2', async () => {
//   const lessonsDTO = {teacherIds: [1, 2], title: "Blue ocean", days: [1], firstDate: "2019-09-01"}
//   const { body } = await createLessons(lessonsDTO);
//   expect(body).toBe("One of fields lessonsCount nor lastDate should be given");
// });

// test('test incorrect lessons dto 3', async () => {
//   const lessonsDTO = {teacherIds: "1", title: "Blue ocean", days: [1], firstDate: "2019-09-01", lessonsCount: 2}
//   const { code } = await createLessons(lessonsDTO);
//   expect(code).toBe(400);
// });

// test('test incorrect lessons dto 4', async () => {
//   const lessonsDTO = {teacherIds: [10], title: "Blue ocean", days: [1], firstDate: "2019-09-01", lessonsCount: 2}
//   const { body } = await createLessons(lessonsDTO);
//   expect(body).toBe("Some teachers not found");
// });

test('test lessons creation', async () => {
  const { lessonsDTO, validResponse } = generateValidLessonsDTO();
  console.log('validResponse', validResponse);
  const { body } = await createLessons(lessonsDTO);
  const lessonIds = range(body[0], validResponse.length / lessonsDTO.teacherIds.length)
  const createdLessonsAndTeachersRelations = await getLessons(lessonIds);
  console.log('createdLessonsAndTeachersRelations', createdLessonsAndTeachersRelations);
  await expect(createdLessonsAndTeachersRelations).toStrictEqual(validResponse);
});

// test('test valida creation request', async () => {
//   const lessonsDTO = { teacherIds: [1], title: "Blue ocean", days: [1], firstDate: "2018-09-06", lessonsCount: 2 };
//   const { body } = await createLessons(lessonsDTO);
//   const lessonIds = range(body[0], 2);
//   console.log('lessonIds', lessonIds);
//   const lessons = await db('lessons').whereIn('id', lessonIds).select('*');
//   lessons = lessons.map(lesson => ({ title: lesson.title, date: lesson.date, status: lesson_status }))
//   console.log('lessons', lessons);
//   await expect(body[0]).toBe(11);

// });

// test('filter lessons', async () => {
//   console.log(process.env.DB_NAME)
//   const { body } = await filterLessons();
//   console.log(body);
//   expect(body).toBe([{d}]);
// });