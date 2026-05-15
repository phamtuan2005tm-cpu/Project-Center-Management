CREATE DATABASE en_center_management;
USE en_center_management;

CREATE TABLE users (
    user_id CHAR(5) PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE, 
    passwork VARCHAR(255) NOT NULL,
    role ENUM('Admin','Teacher', 'Student', 'Parent')
);