npm i
docker-compose down
docker-compose up -d
sleep 2
docker exec lessons_task_db_1 psql -U postgres -c 'create database lessons_reports;'
docker exec lessons_task_db_1 psql -h localhost -U postgres -d lessons_reports -f /database/test.sql