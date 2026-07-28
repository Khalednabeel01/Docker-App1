INSERT INTO mysql_query_rules
(rule_id,active,match_pattern,destination_hostgroup,apply)
VALUES
(1,1,'^SELECT',20,1);

LOAD MYSQL QUERY RULES TO RUNTIME;
SAVE MYSQL QUERY RULES TO DISK;