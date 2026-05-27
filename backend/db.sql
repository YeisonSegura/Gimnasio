-- ============================================================
--  SISTEMA DE INFORMACIÓN - GIMNASIO
--  Para Clever Cloud: NO incluye CREATE DATABASE ni USE
-- ============================================================

CREATE TABLE IF NOT EXISTS clientes (
  id                INT AUTO_INCREMENT PRIMARY KEY,
  nombre            VARCHAR(150) NOT NULL,
  identificacion    VARCHAR(20)  NOT NULL UNIQUE,
  celular           VARCHAR(15)  NOT NULL,
  fecha_inscripcion DATE         NOT NULL DEFAULT (CURRENT_DATE),
  genero            ENUM('Masculino','Femenino','Otro') NOT NULL,
  creado_en         DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS pagos (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id     INT           NOT NULL,
  fecha_pago     DATE          NOT NULL DEFAULT (CURRENT_DATE),
  dias_pagados   INT           NOT NULL,
  valor          DECIMAL(12,2) NOT NULL,
  dias_restantes INT           NOT NULL,
  creado_en      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS asistencia (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT      NOT NULL,
  entrada    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  salida     DATETIME NULL,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE
);

CREATE INDEX idx_pagos_cliente     ON pagos(cliente_id);
CREATE INDEX idx_asistencia_cli    ON asistencia(cliente_id);
CREATE INDEX idx_asistencia_salida ON asistencia(salida);

-- ── Datos de prueba ──────────────────────────────────────────
INSERT INTO clientes (nombre, identificacion, celular, fecha_inscripcion, genero) VALUES
('Carlos Andrés Gómez Ruiz',    '1098001001', '3101234567', '2025-01-10', 'Masculino'),
('Laura Valentina Torres Mesa', '1098001002', '3152345678', '2025-01-15', 'Femenino'),
('Sebastián Felipe Mora López', '1098001003', '3163456789', '2025-02-01', 'Masculino'),
('Daniela Paola Ramos Herrera', '1098001004', '3174567890', '2025-02-10', 'Femenino'),
('Andrés Camilo Vargas Peña',   '1098001005', '3185678901', '2025-02-20', 'Masculino'),
('María Fernanda Díaz Castro',  '1098001006', '3196789012', '2025-03-01', 'Femenino'),
('Juan David Salcedo Ríos',     '1098001007', '3107890123', '2025-03-05', 'Masculino'),
('Valentina Ospina Cárdenas',   '1098001008', '3118901234', '2025-03-12', 'Femenino');

INSERT INTO pagos (cliente_id, fecha_pago, dias_pagados, valor, dias_restantes) VALUES
(1, '2025-05-01', 30,  90000.00,  18),
(2, '2025-05-05', 15,  50000.00,   9),
(3, '2025-05-10', 365, 1000000.00, 300),
(4, '2025-05-12', 10,  80000.00,   4),
(5, '2025-05-15', 30,  90000.00,  22),
(6, '2025-05-18',  1,   8000.00,   0),
(7, '2025-05-20', 15,  50000.00,  12),
(8, '2025-05-22',  5,  40000.00,   3);
