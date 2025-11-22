-- -----------------------------------------------------
-- RHOS Database Schema
-- Sistema de RH com Gestão de Usuários, Perfis e Funcionários
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema RHOS
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `RHOS` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

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
  `status` TINYINT(1) NOT NULL,
  `creation_date` DATETIME NOT NULL,    
  PRIMARY KEY (`id`),
  UNIQUE INDEX `users_email_UNIQUE` (`email` ASC),
  UNIQUE INDEX `users_login_UNIQUE` (`login` ASC),
  UNIQUE INDEX `users_cpf_UNIQUE` (`cpf` ASC)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `RHOS`.`profiles`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`profiles` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `profile_name` VARCHAR(255) NOT NULL,     
  `description` VARCHAR(255) NULL,       
  PRIMARY KEY (`id`),
  UNIQUE INDEX `profiles_name_UNIQUE` (`profile_name` ASC)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `RHOS`.`allowed` 
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`allowed` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `permission_name` VARCHAR(255) NOT NULL, 
  PRIMARY KEY (`id`),
  UNIQUE INDEX `allowed_name_UNIQUE` (`permission_name` ASC)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `RHOS`.`profile_users` 
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`profile_users` (
  `users_id` INT UNSIGNED NOT NULL,
  `profile_id` INT UNSIGNED NOT NULL,
  PRIMARY KEY (`users_id`, `profile_id`),
  INDEX `fk_profile_users_profiles_idx` (`profile_id` ASC), 
  INDEX `fk_profile_users_users_idx` (`users_id` ASC), 
  CONSTRAINT `fk_profile_users_users` 
    FOREIGN KEY (`users_id`)
    REFERENCES `RHOS`.`users` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_profile_users_profiles`
    FOREIGN KEY (`profile_id`)
    REFERENCES `RHOS`.`profiles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `RHOS`.`profile_permissions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`profile_permissions` (
  `profile_id` INT UNSIGNED NOT NULL,
  `permission_id` INT NOT NULL,
  PRIMARY KEY (`profile_id`, `permission_id`),
  INDEX `fk_profile_permissions_permissions_idx` (`permission_id` ASC),
  INDEX `fk_profile_permissions_profiles_idx` (`profile_id` ASC),  
  CONSTRAINT `fk_profile_permissions_profiles`
    FOREIGN KEY (`profile_id`)
    REFERENCES `RHOS`.`profiles` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_profile_permissions_permissions` 
    FOREIGN KEY (`permission_id`)
    REFERENCES `RHOS`.`allowed` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `RHOS`.`audit_logs`
-- -----------------------------------------------------
-- Table `RHOS`.`audit_logs`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`audit_logs` ( 
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` INT UNSIGNED NULL,
  `who` VARCHAR(255) NULL,
  `where` VARCHAR(255) NOT NULL,
  `when` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `what` TEXT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_audit_logs_user_id_idx` (`user_id` ASC),
  CONSTRAINT `fk_audit_logs_users`
    FOREIGN KEY (`user_id`)
    REFERENCES `RHOS`.`users` (`id`)
    ON DELETE SET NULL
    ON UPDATE NO ACTION
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- -----------------------------------------------------
-- Table `RHOS`.`positions`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`positions` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `position_name` VARCHAR(100) NOT NULL,
  `description` TEXT NULL,
  `base_salary` DECIMAL(10,2) NOT NULL,
  `weekly_hours` INT UNSIGNED DEFAULT 44,
  `level` VARCHAR(50) NULL,
  `department` VARCHAR(100) NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `active` TINYINT(1) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  INDEX `idx_position_name` (`position_name` ASC),
  INDEX `idx_active` (`active` ASC)
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Table `RHOS`.`employees`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `RHOS`.`employees` (
  `id` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  
  -- Personal Data
  `full_name` VARCHAR(200) NOT NULL,
  `cpf` VARCHAR(14) NOT NULL,
  `rg` VARCHAR(20) NULL,
  `birth_date` DATE NOT NULL,
  `gender` VARCHAR(20) NULL,
  `marital_status` VARCHAR(30) NULL,
  `nationality` VARCHAR(50) DEFAULT 'Brasileiro',
  
  -- Contact
  `phone` VARCHAR(20) NULL,
  `email` VARCHAR(100) NULL,
  
  -- Address
  `zip_code` VARCHAR(10) NULL,
  `street` VARCHAR(200) NULL,
  `street_number` VARCHAR(10) NULL,
  `complement` VARCHAR(100) NULL,
  `neighborhood` VARCHAR(100) NULL,
  `city` VARCHAR(100) NULL,
  `state` VARCHAR(2) NULL,
  
  -- Employment Data
  `position_id` INT UNSIGNED NOT NULL,
  `hire_date` DATE NOT NULL,
  `termination_date` DATE NULL,
  `status` VARCHAR(20) DEFAULT 'ativo',
  `contract_type` VARCHAR(30) DEFAULT 'CLT',
  
  -- Bank Data
  `bank` VARCHAR(100) NULL,
  `agency` VARCHAR(10) NULL,
  `account` VARCHAR(20) NULL,
  `account_type` VARCHAR(20) NULL,
  
  -- Payment Data
  `current_salary` DECIMAL(10,2) NOT NULL,
  `transportation_voucher` TINYINT(1) DEFAULT 0,
  `meal_voucher` DECIMAL(10,2) DEFAULT 0,
  `health_insurance` TINYINT(1) DEFAULT 0,
  `dental_insurance` TINYINT(1) DEFAULT 0,
  
  -- Dependents for Tax
  `dependents` INT UNSIGNED DEFAULT 0,
  
  -- Documents
  `ctps_numero` VARCHAR(20) NULL,
  `ctps_serie` VARCHAR(20) NULL,
  `ctps_uf` VARCHAR(2) NULL,
  `pis_pasep` VARCHAR(20) NULL,
  `titulo_eleitor` VARCHAR(20) NULL,
  `notes` TEXT NULL,
  
  -- Metadata
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  PRIMARY KEY (`id`),
  UNIQUE INDEX `employees_cpf_UNIQUE` (`cpf` ASC),
  INDEX `fk_employees_position_idx` (`position_id` ASC),
  INDEX `idx_status` (`status` ASC),
  INDEX `idx_full_name` (`full_name` ASC),
  CONSTRAINT `fk_employees_position`
    FOREIGN KEY (`position_id`)
    REFERENCES `RHOS`.`positions` (`id`)
    ON DELETE RESTRICT
    ON UPDATE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------
-- Dados Iniciais
-- -----------------------------------------------------

-- Insert user + profile

INSERT INTO RHOS.profiles (profile_name, description)
VALUES ('Administrador', 'Administrador do sistema') AS new_profile
ON DUPLICATE KEY UPDATE description = new_profile.description;

-- Administrator login: admin password: admin123
INSERT INTO RHOS.users (full_name, email, login, password_hash, cpf, birth_date, status, creation_date)
VALUES ('Admin Teste', 'admin@teste.com', 'admin', '$2b$10$DeecaPnSsA.AVxygB6oIdu3hbNoQVmIysbYEdg5/9rKrsuw7JEzdC', '12345678901', '1990-01-01', 1, NOW());
INSERT INTO RHOS.profile_users (users_id, profile_id)
SELECT u.id, p.id
FROM RHOS.users u
JOIN RHOS.profiles p ON p.profile_name = 'Administrador'
WHERE u.login = 'admin'
ON DUPLICATE KEY UPDATE users_id = users_id;

INSERT INTO RHOS.allowed (permission_name) VALUES
  -- Users
  ('users:create'),
  ('users:read'),
  ('users:update'),
  ('users:delete'),
  ('users:view'),
  -- Profiles
  ('profiles:create'),
  ('profiles:read'),
  ('profiles:update'),
  ('profiles:delete'),
  ('profiles:view'),
  -- Permissions
  ('permissions:view'),
  -- Logs (read and view only)
  ('logs:read'),
  ('logs:view'),
  -- Positions
  ('positions:create'),
  ('positions:read'),
  ('positions:update'),
  ('positions:delete'),
  ('positions:view'),
  -- Employees
  ('employees:create'),
  ('employees:read'),
  ('employees:update'),
  ('employees:delete'),
  ('employees:view'),
  ('employees:calculate') AS new_permission
ON DUPLICATE KEY UPDATE permission_name = new_permission.permission_name;

INSERT INTO RHOS.profile_permissions (profile_id, permission_id)
SELECT p.id, a.id
FROM RHOS.profiles p
JOIN RHOS.allowed a ON a.permission_name IN (
  -- Users
  'users:create',
  'users:read',
  'users:update',
  'users:delete',
  'users:view',
  -- Profiles
  'profiles:create',
  'profiles:read',
  'profiles:update',
  'profiles:delete',
  'profiles:view',
  -- Permissions
  'permissions:view',
  -- Logs
  'logs:read',
  'logs:view',
  -- Positions
  'positions:create',
  'positions:read',
  'positions:update',
  'positions:delete',
  'positions:view',
  -- Employees
  'employees:create',
  'employees:read',
  'employees:update',
  'employees:delete',
  'employees:view',
  'employees:calculate'
)
WHERE p.profile_name = 'Administrador'
ON DUPLICATE KEY UPDATE profile_id = profile_id;
