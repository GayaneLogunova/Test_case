npm i

docker-compose down
docker-compose up -d

sleep 2

docker exec lessons_task_db_1 psql -U postgres -c 'create database lessons_reports;'
docker exec lessons_task_db_1 psql -U postgres -c 'create database test_db;'

docker exec lessons_task_db_1 psql -h localhost -U postgres -d lessons_reports -f /database/test.sql
docker exec lessons_task_db_1 psql -h localhost -U postgres -d test_db -f /database/test.sql

docker exec lessons_task_db_1 psql test_db postgres -c 'truncate lessons, lesson_students, lesson_teachers, teachers, students;'

if [ "$1" = "test" ];
then
    echo "Server will be started in test mode."
    export DB_NAME="test_db"
else 
    echo "Server will be started in production mode."
    export DB_NAME="lessons_reports"
fi

echo "Database name is: $DB_NAME"
npm start