#!/bin/sh

proxysql -f &

echo "Waiting for ProxySQL..."

until mysqladmin ping -h127.0.0.1 -P6032 -uadmin -padmin --silent
do
    sleep 2
done

echo "Loading servers..."
mysql -uadmin -padmin -h127.0.0.1 -P6032 < /scripts/init_servers.sql

echo "Loading users..."
mysql -uadmin -padmin -h127.0.0.1 -P6032 < /scripts/users.sql

echo "Loading Query..."
echo "Done."mysql -h127.0.0.1 -P6032 -uadmin -padmin < /scripts/query_rules.sql

wait
