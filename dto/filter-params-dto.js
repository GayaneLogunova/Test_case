const yup = require('yup');

module.exports = yup.object().shape({
    date: yup.string(),
    status: yup.number().min(0).max(1),
    teacherIds: yup.string(),
    studentsCount: yup.string(),
    page: yup.number(),
    lessonsPerPage: yup.number().default(5),
})