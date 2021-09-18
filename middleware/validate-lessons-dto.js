function validateLessonsDTO(schema) {
    return async (req, res, next) => {
        try {
            const dateFormat = /\d{4}-\d{2}-\d{2}/
            await schema.validate(req.body);
            !dateFormat.test(req.body.firstDate)
                && res.status(400).json('Date format of first date is invalid. Correct type is yyyy-mm-dd');
            if (req.body.lessonsCount && req.body.lastDate) {
                res.status(400).json('LessonsCount and lastDate can`t be given together');
            } else if (!req.body.lessonsCount && !req.body.lastDate) {
                res.status(400).json('One of fields lessonsCount nor lastDate should be given');
            } 
            req.body.lastDate
                && !dateFormat.test(req.body.lastDate)
                && res.status(400).json('Date format of last date is invalid. Correct type is yyyy-mm-dd');

            next();
        } catch (err) {
            res.status(400).json(err.errors);
        }
    } 
}

module.exports = validateLessonsDTO;