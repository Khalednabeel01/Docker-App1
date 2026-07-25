FROM mysql:8.4

COPY wait-and-configure.sh /wait-and-configure.sh
COPY replica.sql /scripts/replica.sql

RUN chmod +x /wait-and-configure.sh

CMD ["/wait-and-configure.sh"]