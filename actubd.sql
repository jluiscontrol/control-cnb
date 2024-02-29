--ACTULIZACION DE LA BD DE CONTROLCNB





ALTER TABLE entidadbancaria
ADD COLUMN acronimo VARCHAR(10),
ADD COLUMN estado BOOLEAN;
ADD COLUMN comision FLOAT,
ADD COLUMN sobregiro FLOAT;

CREATE TABLE cliente (
    id_cliente SERIAL PRIMARY KEY,
    cedula VARCHAR(20) UNIQUE,
    nombres VARCHAR(100),
    telefono VARCHAR(20)
);

CREATE TABLE afectacaja (
    id_afectacaja SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    valor FLOAT,
	estado BOOLEAN
	
);
CREATE TABLE afectacuenta (
    id_afectacuenta SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    valor FLOAT,
	estado BOOLEAN
);
CREATE TABLE tipotransaccion (
    id_tipotransaccion SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    id_afectacaja INT REFERENCES afectacaja(id_afectacaja),
    id_afectacuenta INT REFERENCES afectacuenta(id_afectacuenta)
);

ALTER TABLE entidadbancaria
RENAME COLUMN id TO id_entidadbancaria;


CREATE TABLE operaciones (
    id_operacion SERIAL PRIMARY KEY,
    id_entidadbancaria INT REFERENCES entidadbancaria(id_entidadbancaria),
    id_tipotransaccion INT REFERENCES tipotransaccion(id_tipotransaccion),
    id_cliente INT REFERENCES cliente(id_cliente),
    valor FLOAT,
    referencia VARCHAR(100),
    comentario VARCHAR(255)
);

--hasta aqui 21-02-2024

--PROCEDIMIETOS ALMACENADOS

Tabla "cliente" con los campos "id_cliente", "cedula", "nombres" y "telefono".
Tabla "operaciones" con los campos "id_operacion", "id_entidadbancaria", "id_tipotransaccion", "id_cliente", "valor", "referencia" y "comentario".
Aquí tienes un ejemplo de cómo podríamos escribir un procedimiento almacenado en PostgreSQL para recuperar las operaciones bancarias de un cliente específico:


CREATE OR REPLACE FUNCTION obtener_operaciones_cliente(cliente_id INT)
RETURNS TABLE (
    id_operacion INT,
    id_entidadbancaria INT,
    id_tipotransaccion INT,
    valor FLOAT,
    referencia VARCHAR(100),
    comentario VARCHAR(255)
) AS $$
BEGIN
    RETURN QUERY 
    SELECT 
        op.id_operacion,
        op.id_entidadbancaria,
        op.id_tipotransaccion,
        op.valor,
        op.referencia,
        op.comentario
    FROM 
        operaciones op
    WHERE 
        op.id_cliente = cliente_id;
END;
$$ LANGUAGE plpgsql;

----------------------------------
SELECT * FROM obtener_operaciones_cliente(1); -- Reemplaza 1 con el ID del cliente que deseas consultar

Procedimiento para obtener información de un cliente por su cédula:

CREATE PROCEDURE ObtenerClientePorCedula (
    IN p_cedula VARCHAR(20)
)
BEGIN
    SELECT * FROM cliente WHERE cedula = p_cedula;
END;
Procedimiento para realizar una operación bancaria:
CREATE PROCEDURE RealizarOperacionBancaria (
    IN p_id_entidadbancaria INT,
    IN p_id_tipotransaccion INT,
    IN p_id_cliente INT,
    IN p_valor FLOAT,
    IN p_referencia VARCHAR(100),
    IN p_comentario VARCHAR(255)
)
BEGIN
    INSERT INTO operaciones (id_entidadbancaria, id_tipotransaccion, id_cliente, valor, referencia, comentario)
    VALUES (p_id_entidadbancaria, p_id_tipotransaccion, p_id_cliente, p_valor, p_referencia, p_comentario);
END;

------------25/02/2024
alter table operaciones add numtransaccion varchar(20) unique

ALTER TABLE entidadbancaria DROP COLUMN comision;

CREATE TABLE comision (
    id SERIAL PRIMARY KEY,
    valorcomision NUMERIC(10, 2),
    desde NUMERIC(10, 2),
    hasta NUMERIC(10, 2),
    entidadbancaria_id INT,
    tipotransaccion_id INT,
    estado BOOLEAN,
    FOREIGN KEY (entidadbancaria_id) REFERENCES entidadbancaria(id_entidadbancaria),
    FOREIGN KEY (tipotransaccion_id) REFERENCES tipotransaccion(id_tipotransaccion)
);

ALTER TABLE operaciones
ALTER COLUMN valor TYPE NUMERIC(10, 2);

ALTER TABLE comision
ALTER COLUMN valorcomision TYPE JSON USING 
  ('{"valorcomision": ' || valorcomision || ', "desde": "' || desde || '", "hasta": "' || hasta || '"}')::JSON;

  --inert a la tabla comision
  INSERT INTO comision (valorcomision, tipotransaccion_id, entidadbancaria_id, estado)
    VALUES (
    '{"valorcomision": 10.00, "desde": 100, "hasta": 200}', 2,  3,  true 
        );

--renombrar la clave primaria de la tabla comision
ALTER TABLE comision
RENAME COLUMN id TO id_comision;

ALTER TABLE comision
RENAME CONSTRAINT comision_pkey TO comision_id_comision_pk;

--relacioonar la tabla entidadbancaria con comision
ALTER TABLE entidadbancaria
ADD COLUMN comision_id INT;

ALTER TABLE entidadbancaria
ADD CONSTRAINT fk_comision_id
    FOREIGN KEY (comision_id)
    REFERENCES comision(id_comision);

--aañadir fecha de registro y actulizacion a las tablas necesarias(cliente, entidadbancaria, operaciones, persona, tipotransaccion)
ALTER TABLE entidadbancaria
ADD COLUMN fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

---creamos la tabla caja donde despues vamos a almcear el id del usuario
CREATE TABLE caja (
    id_caja SERIAL PRIMARY KEY,
    nombrecaja VARCHAR(100)
   
);
-- creamos la tabla saldos donde vamos a obtener los saldos tanto de la tabla caja como de la cuenta
CREATE TABLE saldos (
    id_saldo SERIAL PRIMARY KEY,
    saldocuenta NUMERIC(10,2),
    saldocaja NUMERIC(10,2),
    entidadbancaria_id INT,
    caja_id INT,
    FOREIGN KEY (entidadbancaria_id) REFERENCES entidadbancaria(id_entidadbancaria),
    FOREIGN KEY (caja_id) REFERENCES caja(id_caja)
);


--funcion coregida y renombrada
CREATE OR REPLACE FUNCTION agregaSaldo()
RETURNS TRIGGER AS
$$
DECLARE
    v_id_tipotransaccion INTEGER;
    v_valor NUMERIC(10,2);
    v_afectacaja_id INTEGER;
    v_afectacuenta_id INTEGER;
BEGIN
    -- Obtener el id_tipotransaccion y el valor de la inserción en la tabla operaciones
    v_id_tipotransaccion := NEW.id_tipotransaccion;
    v_valor := NEW.valor;

    -- Obtener los valores de afectacaja_id y afectacuenta_id de la tabla tipotransaccion
    SELECT afectacaja_id, afectacuenta_id INTO v_afectacaja_id, v_afectacuenta_id
    FROM tipotransaccion
    WHERE id_tipotransaccion = v_id_tipotransaccion;

    -- Validar si se pudo obtener el id_tipotransaccion y el valor
    IF v_id_tipotransaccion IS NULL OR v_valor IS NULL THEN
        RAISE NOTICE 'No se pudo obtener el id_tipotransaccion y el valor de la inserción en la tabla operaciones.';
        RETURN NULL;
    END IF;

    -- Realizar la inserción en la tabla saldos dependiendo de las condiciones
    CASE WHEN v_afectacaja_id = 1 AND v_afectacuenta_id = 2 THEN
        RAISE NOTICE 'El id_tipotransaccion % cumple con la condición: SUMA CAJA RESTA CUENTA.', v_id_tipotransaccion;
        INSERT INTO saldos (saldocaja, saldocuenta, entidadbancaria_id)
        VALUES (v_valor, -v_valor, NEW.id_entidadbancaria);

    WHEN v_afectacaja_id = 2 AND v_afectacuenta_id = 1 THEN
        RAISE NOTICE 'El id_tipotransaccion % cumple con la condición: RESTA CAJA SUMA CUENTA.', v_id_tipotransaccion;
        INSERT INTO saldos (saldocaja, saldocuenta, entidadbancaria_id)
        VALUES (-v_valor, v_valor, NEW.id_entidadbancaria);

    WHEN v_afectacaja_id = 1 AND v_afectacuenta_id = 3 THEN
        RAISE NOTICE 'El id_tipotransaccion % cumple con la condición: SUMA CAJA - NO AFECTA A CUENTA.', v_id_tipotransaccion;
        INSERT INTO saldos (saldocaja, saldocuenta, entidadbancaria_id)
        VALUES (v_valor, 0, NEW.id_entidadbancaria);

    WHEN v_afectacaja_id = 3 AND v_afectacuenta_id = 1 THEN
        RAISE NOTICE 'El id_tipotransaccion % cumple con la condición: NO AFECTA - SUMA A CUENTA.', v_id_tipotransaccion;
        INSERT INTO saldos (saldocaja, saldocuenta, entidadbancaria_id)
        VALUES (0, v_valor, NEW.id_entidadbancaria);

    WHEN v_afectacaja_id = 2 AND v_afectacuenta_id = 3 THEN
        RAISE NOTICE 'El id_tipotransaccion % cumple con la condición: RESTA CAJA  - NO AFECTA.', v_id_tipotransaccion;
        INSERT INTO saldos (saldocaja, saldocuenta, entidadbancaria_id)
        VALUES (-v_valor, 0, NEW.id_entidadbancaria);

    WHEN v_afectacaja_id = 3 AND v_afectacuenta_id = 2 THEN
        RAISE NOTICE 'El id_tipotransaccion % cumple con la condición: NO AFECTA CAJA  - RESTA CUENTA.', v_id_tipotransaccion;
        INSERT INTO saldos (saldocaja, saldocuenta, entidadbancaria_id)
        VALUES (0, -v_valor, NEW.id_entidadbancaria);

    ELSE
        RAISE NOTICE 'El id_tipotransaccion % no cumple con ninguna condición válida.', v_id_tipotransaccion;
    END CASE;

    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

 CREATE TRIGGER trigger_agregaSaldo
AFTER INSERT ON operaciones
FOR EACH ROW
EXECUTE FUNCTION agregaSaldo();








INSERT INTO public.operaciones (id_entidadbancaria, id_tipotransaccion, id_cliente, valor, referencia, comentario, numtransaccion)
VALUES (5, 2, 1, 100.00, 'es una prueba de pago', 'comentario', '44545236');
----29-02-2024 
alter table entidadbancaria drop table id_comision