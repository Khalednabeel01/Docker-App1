INSERT INTO mysql_servers (hostgroup_id, hostname, port)
VALUES
(10, 'container_db', 3306),
(20, 'mysql-replica', 3306);

LOAD MYSQL SERVERS TO RUNTIME;
SAVE MYSQL SERVERS TO DISK;