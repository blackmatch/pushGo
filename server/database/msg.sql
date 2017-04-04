DROP DATABASE IF EXISTS msg;

CREATE DATABASE msg DEFAULT CHARACTER SET utf8 collate utf8_general_ci;

USE msg;

CREATE TABLE `msg` (
  `msgid` varchar(36) NOT NULL,
  `type`  ENUM('user','system','other') DEFAULT 'user',
  `sender` varchar(36) DEFAULT 'server',
  `receiver` varchar(36) NOT NULL,
  `content` json NOT NULL,
  `createAt` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `senderDevice` ENUM('web','iOS','Android','server') DEFAULT 'server',
  `receiverDevice` ENUM('web','iOS','Android') DEFAULT 'web',
  `channel` ENUM('socket','jpush') DEFAULT 'socket',
  `receiveAt` timestamp NULL DEFAULT NULL,
  `readAt` timestamp NULL DEFAULT NULL,
  `status` tinyint NOT NULL DEFAULT 0,  -- 0:sending(created), 1:received(client have received), 2:failed(user offline or other reason), 3:user have read msg.
  PRIMARY KEY (`msgid`)
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