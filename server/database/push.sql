DROP DATABASE IF EXISTS push;

CREATE DATABASE push DEFAULT CHARACTER SET utf8 collate utf8_general_ci;

USE push;

CREATE TABLE `event` (
  `eid` varchar(36) NOT NULL,
  `sender` varchar(36) DEFAULT 'SERVER',
  `receiver` varchar(36) NOT NULL,
  `content` text NOT NULL,
  `received` tinyint(1) DEFAULT 0,
  `read` tinyint(1) DEFAULT 0,
  `device` ENUM('web','iOS','Android','unknow') DEFAULT 'unknow',
  `way` varchar(100) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`eid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;	

CREATE TABLE `user` (
  `uid` varchar(36) NOT NULL,
  `username` varchar(100) NOT NULL,
  `nickname` varchar(100),
  `password` varchar(200) NOT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`uid`),
  UNIQUE (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;	