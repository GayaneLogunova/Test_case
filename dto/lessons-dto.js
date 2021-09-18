const yup = require('yup');

module.exports = yup.object().shape({
    teacherIds: yup
        .array()
        .of(yup.number().required("at leat one teacher id is required"))
        .strict()
        .required(),
    title: yup.string().trim().required("title is required"),
    days: yup
        .array()
        .of(yup.number().max(7).required())
        .strict()
        .required("at least one day is required"),
    firstDate: yup.string().trim().required('firstDate is required'),
    lessonsCount: yup.number(),
    lastDate: yup.string(),
})