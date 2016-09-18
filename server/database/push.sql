DROP DATABASE IF EXISTS event_system;

CREATE DATABASE event_system DEFAULT CHARACTER SET utf8 collate utf8_general_ci;

USE event_system;

CREATE TABLE `event` (
  `eventid` varchar(36) NOT NULL,
  `sender` varchar(36) DEFAULT 'server',
  `receiver` varchar(36) NOT NULL,
  `content` varchar(1000) NOT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `senderDevice` ENUM('web','iOS','Android','server') DEFAULT 'server',
  `receiverDevice` ENUM('web','iOS','Android') DEFAULT 'web',
  `channel` ENUM('socket','jpush') DEFAULT 'socket',
  `receiveAt` timestamp NULL DEFAULT NULL,
  `readAt` timestamp NULL DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT 0,
  PRIMARY KEY (`eventid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;	

CREATE TABLE `user` (
  `uid` varchar(36) NOT NULL,
  `username` varchar(100) NOT NULL,
  `nickname` varchar(100),
  `password` varchar(500) NOT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `token` varchar(2500),
  PRIMARY KEY (`uid`),
  UNIQUE (username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;	