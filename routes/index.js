const express = require('express');
const lessonsController = require('../controller/lessons');
const validateLessonsDTO = require('../middleware/validate-lessons-dto');
const validateFilterParamsDTO = require('../middleware/validate-filter-params-dto');
const lessonsDTO = require('../dto/lessons-dto');
const filterParamsDTO = require('../dto/filter-params-dto');

const router = express.Router();

router.get('/', validateFilterParamsDTO(filterParamsDTO), lessonsController.filterLessons);

router.post('/lessons', validateLessonsDTO(lessonsDTO), lessonsController.createLessons);

module.exports = router;