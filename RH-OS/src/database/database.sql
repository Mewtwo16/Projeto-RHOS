-- MySQL Workbench Forward Engineering (corrigido e atualizado)

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema RHOS
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `RHOS` DEFAULT CHARACTER SET utf8 ;
USE `RHOS` ;

-- -----------------------------------------------------
-- Table `RHOS`.`usuarios`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`usuarios` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome_completo` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `login` VARCHAR(45) NOT NULL,
  `senha_hash` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(11) NOT NULL,
  `dataNascimento` DATE NOT NULL,
  `status` TINYINT NOT NULL,
  `data_criacao` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `user_email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `user_login_UNIQUE` (`login` ASC) VISIBLE,
  UNIQUE INDEX `user_senha_hash_UNIQUE` (`senha_hash` ASC) VISIBLE,
  UNIQUE INDEX `user_cpf_UNIQUE` (`cpf` ASC) VISIBLE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `RHOS`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nome_role` VARCHAR(255) NOT NULL,
  `descricao` VARCHAR(255) NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `roles_name_UNIQUE` (`nome_role` ASC) VISIBLE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `RHOS`.`permissao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`permissao` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `permissao_nome` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `permissao_nome_UNIQUE` (`permissao_nome` ASC) VISIBLE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `RHOS`.`role_usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`role_usuario` (
  `user_id` INT UNSIGNED NOT NULL,
  `roles_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`user_id`, `roles_id`),
  INDEX `fk_reg_user_has_roles_roles1_idx` (`roles_id` ASC) VISIBLE,
  INDEX `fk_reg_user_has_roles_reg_user_idx` (`user_id` ASC) VISIBLE,
  CONSTRAINT `fk_reg_user_has_roles_reg_user`
    FOREIGN KEY (`user_id`)
    REFERENCES `RHOS`.`usuarios` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_reg_user_has_roles_roles1`
    FOREIGN KEY (`roles_id`)
    REFERENCES `RHOS`.`roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `RHOS`.`roles_permissao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`roles_permissao` (
  `roles_id` INT UNSIGNED NOT NULL,
  `permissao_id` INT NOT NULL,
  PRIMARY KEY (`roles_id`, `permissao_id`),
  INDEX `fk_roles_has_user_permissao_user_permissao1_idx` (`permissao_id` ASC) VISIBLE,
  INDEX `fk_roles_has_user_permissao_roles1_idx` (`roles_id` ASC) VISIBLE,
  CONSTRAINT `fk_roles_has_user_permissao_roles1`
    FOREIGN KEY (`roles_id`)
    REFERENCES `RHOS`.`roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_roles_has_user_permissao_user_permissao1`
    FOREIGN KEY (`permissao_id`)
    REFERENCES `RHOS`.`permissao` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
