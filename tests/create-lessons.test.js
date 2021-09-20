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
  const teacherIds = getRandomTeacherIds();
  const days = getRandomWeekDays();
  const firstDate = "2018-09-01";

  let validResponse = [];
  const amountOfLessons = getRandomInt(300) + 1;

  let index = 1;
  let date = days.includes(new Date(firstDate).getDay()) ? firstDate : lessonsCreation.findNextDate(firstDate, days);
  while (amountOfLessons >= index) {
    for (const teacherId of teacherIds) {
      validResponse.push({ title: "Blue ocean", date: format(new Date(date), 'yyyy-MM-dd'), status: 0, teacherId });
    }
    index++;
    const nextDate = lessonsCreation.findNextDate(date, days);
    if (lessonsCreation.getDifferenceInDays(firstDate, nextDate) > 365) {
      break;
    }
    date = amountOfLessons >= index ? lessonsCreation.findNextDate(date, days) : date;
  }

  if (getRandomInt(2) === 0) {
    return {
      lessonsDTO: { teacherIds, title: "Blue ocean", days, firstDate, lessonsCount: index - 1 },
      validResponse,
    };
  }

  return {
    lessonsDTO: { teacherIds, title: "Blue ocean", days, firstDate, lastDate: format(new Date(date), 'yyyy-MM-dd') },
    validResponse,
  };

}


async function filterLessons(filterParams){
  var clientServerOptions = {
      url: 'http://localhost:3000/',
      data: filterParams,
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

async function getLessonsForFiltation() {
  const lessons = await db('lessons').select('*')    
  const teachers = await db('teachers').select('*');
  const students = await db('students').select('*');
  const lesson_teachers = await db('lesson_teachers').select('*');
  const lesson_students = await db('lesson_students').select('*');

  return { lessons, teachers, students, lesson_teachers, lesson_students };
}

function filterByDate(lesson, date) {
  if (date && !date.includes(',')) {
      return format(new Date(date), 'yyyy-MM-dd') === format(lesson.date, 'yyyy-MM-dd');
  } else if (date) {
      return format(new Date(date.split(',')[0]), 'yyyy-MM-dd') <= format(lesson.date, 'yyyy-MM-dd')
          && format(new Date(date.split(',')[1]), 'yyyy-MM-dd') >= format(lesson.date, 'yyyy-MM-dd');
  }
  return true;
}


function filterByStudents(lesson, studentsCount, countedStudents) {
  let selectedLessonIds = [];
  if (studentsCount && !studentsCount.includes(',')) {
      for (const key in countedStudents) {
          if (countedStudents[key].toString() === studentsCount && !selectedLessonIds.includes(key)) {
              selectedLessonIds.push(key);
          }
      }
  } else if (studentsCount) {
      const min = studentsCount.toString().split(',')[0];
      const max = studentsCount.toString().split(',')[1];
      for (const key in countedStudents) {
          if (countedStudents[key] >= min && countedStudents[key] <= max) {
              selectedLessonIds.push(key);
          }
      }
  }

  if (studentsCount) {
      return selectedLessonIds.includes(lesson.id.toString());
  }
  return true;
}

function filterByStatus(lesson, status) {
  if (status) {
      return lesson.status === status;
  }
  return true;
}

function filterByTeachers(lesson, teacherIds, selectedLessonsIds) {
  if (teacherIds) {
      return selectedLessonsIds.includes(lesson.id);
  }
  return true;
}

function cmp(first, second) {
  if (first.id < second.id) return -1;
  if (first.id > second.id) return 1;
  return 0;
}

function mapLessons(filteredLessons, teachers, students, lesson_students, lesson_teachers) {
  const lessons = filteredLessons.map(lesson => ({
      id: lesson.id,
      date: format(lesson.date, 'yyyy-MM-dd'),
      title: lesson.title,
      status: lesson.status,
      visitCount: lesson_students.filter(({ visit, lesson_id }) => visit && lesson_id === lesson.id).length,
      students: lesson_students.filter(({ lesson_id }) => lesson_id === lesson.id)
          .map(student => ({
              id: student.student_id,
              name: students.find(({ id }) => student.student_id === id)?.name,
              visit: student.visit ? true : false,
          })),
      teachers: lesson_teachers.filter(({ lesson_id }) => lesson_id === lesson.id)
          .map(({ teacher_id }) => ({
              id: teacher_id,
              name: teachers.find(({ id }) => teacher_id === id)?.name
          })),
  }));

  return lessons;
}

function getValidResponse(lessons, teachers, students, lesson_teachers, lesson_students, filterParams) {
  const lessonsPerPage = filterParams.lessonsPerPage || 5;

  let filteredLessons = [];
  let selectedLessonsIds = [];
  let countedStudents = {};

  if (filterParams.teacherIds) {
      for (const lessonToTeacherRelation of lesson_teachers) {
          if (filterParams.teacherIds.split(',').includes(lessonToTeacherRelation.teacher_id.toString()) && !selectedLessonsIds.includes(lessonToTeacherRelation.lesson_id)) {
              selectedLessonsIds.push(lessonToTeacherRelation.lesson_id);
          }
      }
  }

  if (filterParams.studentsCount) {
      for (const lessonToTeacherRelation of lesson_teachers) {
          if (!countedStudents[lessonToTeacherRelation.lesson_id]) {
              countedStudents[lessonToTeacherRelation.lesson_id] = 0;
          }
          countedStudents[lessonToTeacherRelation.lesson_id] += 1;
      }
  }

  for (const lesson of lessons) {
      if (
          filterByDate(lesson, filterParams.date)
          && filterByStatus(lesson, filterParams.status)
          && filterByTeachers(lesson, filterParams.teacherIds, selectedLessonsIds)
          && filterByStudents(lesson, filterParams.studentsCount, countedStudents)
      ) {
          filteredLessons.push(lesson);
      }
  }

  filteredLessons = filteredLessons.sort(cmp);
  if (filterParams.page) {
      filteredLessons.slice((filterParams.page - 1) * lessonsPerPage, filterParams.page * lessonsPerPage);
  }
  

  return mapLessons(filteredLessons, teachers, students, lesson_students, lesson_teachers);
      
}

test('filter without filterParams', async () => {
  const { lessons, teachers, students, lesson_teachers, lesson_students } = await getLessonsForFiltation();
  const correctResponse = getValidResponse(lessons, teachers, students, lesson_teachers, lesson_students, {});
  const { body } = await filterLessons({});
  expect(body).toStrictEqual(correctResponse);
})


test('filter lessons wirh filterParams', async () => {
  const { lessons, teachers, students, lesson_teachers, lesson_students } = await getLessonsForFiltation();
  const filterParams = {
      date: "2019-09-02,2019-09-06",
      status: 0,
      teacherIds: "1,2",
      studentsCount: "1,2",
      page: 1,
      lessonsPerPage: 2,
  };
  const correctResponse = getValidResponse(lessons, teachers, students, lesson_teachers, lesson_students, filterParams);
  const { body } = await filterLessons(filterParams);
  expect(body).toStrictEqual(correctResponse);
});

test('test incorrect lessons dto 1', async () => {
  const lessonsDTO = {teacherIds: [1, 2], title: "Blue ocean", days: [1], firstDate: "2019-09-01", lessonsCount: 2, lastDate: "2019-09-07"}
  const { body } = await createLessons(lessonsDTO);
  expect(body).toBe("LessonsCount and lastDate can`t be given together");
});

test('test incorrect lessons dto 2', async () => {
  const lessonsDTO = {teacherIds: [1, 2], title: "Blue ocean", days: [1], firstDate: "2019-09-01"}
  const { body } = await createLessons(lessonsDTO);
  expect(body).toBe("One of fields lessonsCount nor lastDate should be given");
});

test('test incorrect lessons dto 3', async () => {
  const lessonsDTO = {teacherIds: "1", title: "Blue ocean", days: [1], firstDate: "2019-09-01", lessonsCount: 2}
  const { code } = await createLessons(lessonsDTO);
  expect(code).toBe(400);
});

test('test incorrect lessons dto 4', async () => {
  const lessonsDTO = {teacherIds: [10], title: "Blue ocean", days: [1], firstDate: "2019-09-01", lessonsCount: 2}
  const { body } = await createLessons(lessonsDTO);
  expect(body).toBe("Some teachers not found");
});

test('test lessons creation', async () => {
  const { lessonsDTO, validResponse } = generateValidLessonsDTO();
  const { body } = await createLessons(lessonsDTO);
  const lessonIds = range(body[0], validResponse.length / lessonsDTO.teacherIds.length)
  const createdLessonsAndTeachersRelations = await getLessons(lessonIds);
  await expect(createdLessonsAndTeachersRelations).toStrictEqual(validResponse);
});

