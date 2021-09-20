const lessonsCreationService = require('../service/lessons-creation');
const lessonsFiltrationSevice = require('../service/lessons-filtration');

class LessonsController {
    async createLessons(req, res) {
        try {
            const id = await lessonsCreationService.createLessons(req.body);
            res.status(201).json(id);
        } catch (error) {
            res.status(520).json(error.message);
        }
    }

    async filterLessons(req, res) {
        try {
            const lessons = await lessonsFiltrationSevice.filterLessons(req.body);
            res.status(200).json(lessons);
        } catch (err) {
            res.status(520).json("something went wrong during filtration");
        }
    }
}

module.exports = new LessonsController();