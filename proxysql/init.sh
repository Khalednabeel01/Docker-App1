#!/bin/sh

until mysqladmin ping -h 127.0.0.1 -P6032 -uadmin -padmin --silent
do
    sleep 2
done

mysql \
    -u admin \
    -padmin \
    -h 127.0.0.1 \
    -P6032 \
    < /scripts/users.sql

echo "ProxySQL users configured successfully."