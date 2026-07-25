#!/bin/sh

echo "Waiting for Primary..."

until mysqladmin ping -h db -uroot -ppassword --silent
do
    sleep 2
done

echo "Waiting for Replica..."

until mysqladmin ping -h mysql-replica -ukhaled -pdevops123 --silent
do
    sleep 2
done

echo "Configuring replication..."

mysql \
    -h mysql-replica \
    -ukhaled \
    -pdevops123 \
    < /scripts/replica.sql

echo "Replication configured successfully."
