const LessonsDAO = require('../dao/lessons');

test('create lessons', () => {
    const lessonsToCreate = [
        {date: "2020-08-02", title: "lesson", status: 0},
        {date: "2020-08-03", title: "lesson", status: 0},
    ]
    expect(LessonsDAO.createLessons(lessonsToCreate))
        .toBe(3);
});

describe("Filter function", () => {
    test("it should filter lessons", () => {
      const input = [
        { id: 1, url: "https://www.url1.dev" },
        { id: 2, url: "https://www.url2.dev" },
        { id: 3, url: "https://www.link3.dev" }
      ];
  
      const output = [{ id: 3, url: "https://www.link3.dev" }];
  
      expect(filterByTerm(input, "link")).toEqual(output);
  
    });
  });