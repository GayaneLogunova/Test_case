const lessonsService = require('../service/lessons');

class LessonsController {
    async createLessons(req, res) {
        try {
            const id = await lessonsService.createLessons(req.body);
            res.status(201).json(id);
        } catch (err) {
            res.status(520).json("something went wrong during lessons creation");
        }
    }

    async filterLessons(req, res) {
        try {
            const lessons = await lessonsService.filterLessons(req.body);
            res.status(200).json(lessons);
        } catch (err) {
            res.status(520).json("something went wrong during filtration");
        }
    }
}

module.exports = new LessonsController();