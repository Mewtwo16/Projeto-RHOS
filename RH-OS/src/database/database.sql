SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema RHOS
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `RHOS` DEFAULT CHARACTER SET utf8 ;
USE `RHOS` ;

-- -----------------------------------------------------
-- Table `RHOS`.`users`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`users` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `full_name` VARCHAR(255) NOT NULL,     
  `email` VARCHAR(255) NOT NULL,
  `login` VARCHAR(45) NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `cpf` VARCHAR(11) NOT NULL,
  `birth_date` DATE NOT NULL,            
  `status` TINYINT NOT NULL,
  `creation_date` DATETIME NOT NULL,    
  PRIMARY KEY (`id`),
  UNIQUE INDEX `users_email_UNIQUE` (`email` ASC) VISIBLE,
  UNIQUE INDEX `users_login_UNIQUE` (`login` ASC) VISIBLE,
  UNIQUE INDEX `users_cpf_UNIQUE` (`cpf` ASC) VISIBLE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `RHOS`.`roles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`roles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `role_name` VARCHAR(255) NOT NULL,     
  `description` VARCHAR(255) NULL,       
  PRIMARY KEY (`id`),
  UNIQUE INDEX `roles_name_UNIQUE` (`role_name` ASC) VISIBLE
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `RHOS`.`allowed` 
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`allowed` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `permission_name` VARCHAR(255) NOT NULL, 
  PRIMARY KEY (`id`),
  UNIQUE INDEX `allowed_name_UNIQUE` (`permission_name` ASC) VISIBLE 
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `RHOS`.`role_users` 
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`role_users` (
  `users_id` INT UNSIGNED NOT NULL,
  `roles_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`users_id`, `roles_id`),
  INDEX `fk_role_users_roles_idx` (`roles_id` ASC) VISIBLE, 
  INDEX `fk_role_users_users_idx` (`users_id` ASC) VISIBLE, 
  CONSTRAINT `fk_role_users_users` 
    FOREIGN KEY (`users_id`)
    REFERENCES `RHOS`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_role_users_roles`
    FOREIGN KEY (`roles_id`)
    REFERENCES `RHOS`.`roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `RHOS`.`roles_allowed`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`roles_allowed` (
  `roles_id` INT UNSIGNED NOT NULL,
  `allowed_id` INT NOT NULL,
  PRIMARY KEY (`roles_id`, `allowed_id`),
  INDEX `fk_roles_allowed_allowed_idx` (`allowed_id` ASC) VISIBLE,
  INDEX `fk_roles_allowed_roles_idx` (`roles_id` ASC) VISIBLE,  
  CONSTRAINT `fk_roles_allowed_roles`
    FOREIGN KEY (`roles_id`)
    REFERENCES `RHOS`.`roles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_roles_allowed_allowed` 
    FOREIGN KEY (`allowed_id`)
    REFERENCES `RHOS`.`allowed` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARSET=utf8;

-- -----------------------------------------------------
-- Table `RHOS`.`audit_logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`audit_logs` ( 
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `users_id` INT UNSIGNED NOT NULL,
  `action` VARCHAR(100) NOT NULL,
  `resource` VARCHAR(100) NULL,
  `resource_id` INT NULL,
  `details` JSON NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `fk_audit_logs_users_id_idx` (`users_id` ASC) VISIBLE,
  CONSTRAINT `fk_audit_logs_users`
    FOREIGN KEY (`users_id`)
    REFERENCES `RHOS`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARSET=utf8;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;




-- Insert usuario + role

INSERT INTO RHOS.roles (role_name, description)
VALUES ('Administrador', 'Administrador do sistema')
ON DUPLICATE KEY UPDATE description = VALUES(description);

-- Adiministrador login: admin senha: admin123
INSERT INTO RHOS.users (full_name, email, login, password_hash, cpf, birth_date, status, creation_date)
VALUES ('Admin Teste', 'admin@teste.com', 'admin', '$2b$10$DeecaPnSsA.AVxygB6oIdu3hbNoQVmIysbYEdg5/9rKrsuw7JEzdC', '12345678901', '1990-01-01', 1, NOW());
INSERT INTO RHOS.role_users (users_id, roles_id)
SELECT u.id, r.id
FROM RHOS.users u
JOIN RHOS.roles r ON r.role_name = 'Administrador'
WHERE u.login = 'admin'
ON DUPLICATE KEY UPDATE users_id = users_id;

