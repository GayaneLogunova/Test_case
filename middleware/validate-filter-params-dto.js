function validateFilterParamsDTO(schema) {
    return async (req, res, next) => {
        try {
            const dateFormat = /\d{4}-\d{2}-\d{2}/;
            const number = /^-?\d+$/;
            const validatedBody = await schema.validate(req.body);

            if (validatedBody.date && !validatedBody.date.includes(',')) {
                !dateFormat.test(validatedBody.date)
                    && res.status(400).json('Date format of date is invalid. Correct type is yyyy-mm-dd')
            } else if (validatedBody.date) {
                !dateFormat.test(validatedBody.date.split(',')[0])
                    || !dateFormat.test(validatedBody.date.split(',')[1])
                    && res.status(400).json('Date format of dates is invalid. Correct type is yyyy-mm-dd')
            }
            if (validatedBody.studentsCount && !validatedBody.studentsCount.includes(',')) {
                !number.test(validatedBody.studentsCount) && res.status(400).json('Students count should be number')
            } else if (validatedBody.studentsCount) {
                !number.test(validatedBody.studentsCount.split(',')[0])
                || !number.test(validatedBody.studentsCount.split(',')[1])
                && res.status(400).json('Students count should be numbers')
            }

            req.body = validatedBody;
            next();
        } catch (err) {
            res.status(400).json(err);
        }
    } 
}

module.exports = validateFilterParamsDTO;