--- Query para resetear los valores de las tablas de la base de datos --

BEGIN;

-- Desactivar las restricciones de llave foránea
ALTER TABLE operaciones DISABLE TRIGGER ALL;
ALTER TABLE saldos DISABLE TRIGGER ALL;
ALTER TABLE encabezadoarqueo DISABLE TRIGGER ALL;
ALTER TABLE detallearqueo DISABLE TRIGGER ALL;

-- Truncar la tabla y reiniciar la secuencia de ID
TRUNCATE TABLE operaciones, saldos, encabezadoarqueo, detallearqueo RESTART IDENTITY;

-- Reactivar las restricciones de llave foránea
ALTER TABLE operaciones ENABLE TRIGGER ALL;
ALTER TABLE saldos ENABLE TRIGGER ALL;
ALTER TABLE encabezadoarqueo ENABLE TRIGGER ALL;
ALTER TABLE detallearqueo ENABLE TRIGGER ALL;

-- Resetear los saldos de comisión y caja acumulados --
UPDATE caja
SET saldocomision = 0.00, saldocaja = 0.00;

COMMIT;
