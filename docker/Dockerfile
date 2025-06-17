FROM ubuntu:latest

FROM maven:3.9.9

WORKDIR ../backend
COPY . .
RUN mvn clean install
CMD mvn spring-boot:run