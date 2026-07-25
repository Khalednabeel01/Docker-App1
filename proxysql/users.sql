INSERT INTO mysql_users
(username, password, default_hostgroup)
VALUES
('user', 'password', 10);

LOAD MYSQL USERS TO RUNTIME;
SAVE MYSQL USERS TO DISK;