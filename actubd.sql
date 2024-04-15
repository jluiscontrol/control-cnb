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
alter table entidadbancaria drop column comision_id

---funcion para traer toda la necesaria de la tabla operaciones ya relacionadas
SELECT 
    e.entidad AS entidad,
    tt.nombre AS tipotransaccion,
    c.cedula AS cedula_cliente,
    c.nombres AS nombres_cliente,
    c.telefono AS telefono_cliente,
    o.valor AS valor_operacion,
    o.comentario AS comentario_operacion,
    o.numtransaccion AS num_transaccion,
    o.fecha_registro AS fecha_registro_operacion,
    o.fecha_actualizacion AS fecha_actualizacion_operacion,
    co.valorcomision AS valor_comision,
    ac.nombre AS afectacion_caja,
    au.nombre AS afectacion_cuenta
FROM 
    operaciones o
JOIN 
    entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
JOIN 
    cliente c ON o.id_cliente = c.id_cliente
JOIN 
    tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
LEFT JOIN
    comision co ON e.id_entidadbancaria = co.entidadbancaria_id
LEFT JOIN
    afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
LEFT JOIN
    afectacuenta au ON tt.afectacuenta_id = au.id_afectacuenta
ORDER BY 
    afectacion_caja,
    afectacion_cuenta;
--ejemplo de como llamrarlo en el modelo

async function getOperaciones() {
  const query = 'SELECT * FROM operaciones_view'; // Utiliza la vista en lugar de la tabla
  const { rows } = await pool.query(query);
  return rows;
}

module.exports = {
  getOperaciones
};
--fin de funcnion en el modelo

--- CONSULTA PARA FILTRAR LA INFORMACION DE OPERACIONES POR FECHAS INCLUYENDO LA HORA
SELECT 
    e.entidad AS entidad,
    tt.nombre AS tipotransaccion,
    c.cedula AS cedula_cliente,
    c.nombres AS nombres_cliente,
    c.telefono AS telefono_cliente,
    o.valor AS valor_operacion,
    o.comentario AS comentario_operacion,
    o.numtransaccion AS num_transaccion,
    o.fecha_registro AS fecha_registro_operacion,
    o.fecha_actualizacion AS fecha_actualizacion_operacion,
    co.valorcomision AS valor_comision,
    ac.nombre AS afectacion_caja,
    au.nombre AS afectacion_cuenta
FROM 
    operaciones o
JOIN 
    entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
JOIN 
    cliente c ON o.id_cliente = c.id_cliente
JOIN 
    tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
LEFT JOIN
    comision co ON e.id_entidadbancaria = co.entidadbancaria_id
LEFT JOIN
    afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
LEFT JOIN
    afectacuenta au ON tt.afectacuenta_id = au.id_afectacuenta
WHERE
    o.fecha_registro >= '2024-03-03 00:00:00' -- Fecha desde con hora inicial
    AND o.fecha_registro <= '2024-03-03 23:59:59' -- Fecha hasta con hora final
ORDER BY 
    afectacion_caja,
    afectacion_cuenta;

--- CONSULTA PARA FILTRAR LA INFORMACION DE OPERACIONES POR FECHAS Y NO LA HORA
SELECT 
    e.entidad AS entidad,
    tt.nombre AS tipotransaccion,
    c.cedula AS cedula_cliente,
    c.nombres AS nombres_cliente,
    c.telefono AS telefono_cliente,
    o.valor AS valor_operacion,
    o.comentario AS comentario_operacion,
    o.numtransaccion AS num_transaccion,
    o.fecha_registro AS fecha_registro_operacion,
    o.fecha_actualizacion AS fecha_actualizacion_operacion,
    co.valorcomision AS valor_comision,
    ac.nombre AS afectacion_caja,
    au.nombre AS afectacion_cuenta
FROM 
    operaciones o
JOIN 
    entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
JOIN 
    cliente c ON o.id_cliente = c.id_cliente
JOIN 
    tipotransaccion tt ON o.id_tipotransaccion = tt.id_tipotransaccion
LEFT JOIN
    comision co ON e.id_entidadbancaria = co.entidadbancaria_id
LEFT JOIN
    afectacaja ac ON tt.afectacaja_id = ac.id_afectacaja
LEFT JOIN
    afectacuenta au ON tt.afectacuenta_id = au.id_afectacuenta
WHERE
    DATE(o.fecha_registro) >= '2024-03-03' -- Fecha desde
    AND DATE(o.fecha_registro) <= '2024-03-03' -- Fecha hasta
ORDER BY 
    afectacion_caja,
    afectacion_cuenta;

---consulta donde me traiga el valor total de todo lo recaudado sin validacion de algun campo
SELECT SUM(valor) AS total_valor_operaciones
FROM operaciones;
---en esta consulta mostrara el valor total de todas la entidades bancarias
SELECT 
    e.entidad AS entidad,
    SUM(o.valor) AS total_valor_operaciones
FROM 
    operaciones o
JOIN 
    entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
GROUP BY 
    e.entidad;

---consulta del valor total de una entidad en especifico
SELECT 
    e.entidad AS entidad,
    SUM(o.valor) AS total_valor_operaciones
FROM 
    operaciones o
JOIN 
    entidadbancaria e ON o.id_entidadbancaria = e.id_entidadbancaria
WHERE 
    e.id_entidadbancaria = 5
GROUP BY 
    e.entidad;

    /********* 07/03/2024 **********/
    /* eliminar primero la tabla creada*/
    CREATE TABLE caja (
    id_caja SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    estado BOOLEAN,
    fechacreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fechamodificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

    ALTER TABLE public.usuario
    ADD COLUMN caja_id INTEGER,
    ADD CONSTRAINT usuario_caja_id_fkey FOREIGN KEY (caja_id) REFERENCES public.caja(id_caja);


    ALTER TABLE public.operaciones
    ADD COLUMN id_usuario integer,
    ADD CONSTRAINT operaciones_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


    ALTER TABLE public.operaciones
    ADD COLUMN saldocomision numeric(10,2);


----consulta para traer el saldo total de una entidad bancaria ubicando la entidad bancaria
    SELECT SUM(saldocuenta) AS total_saldocuenta
    FROM public.saldos
    WHERE entidadbancaria_id = 5;


----saldo caja general
   SELECT SUM(saldocaja) AS total_saldocaja
   FROM public.saldos;
---suma total por canda entidad bacanria
    SELECT entidadbancaria_id, SUM(saldocuenta) AS saldo_total_cuenta
    FROM public.saldos
    GROUP BY entidadbancaria_id;

    -----10/03/2024
    ALTER TABLE public.operaciones
    ADD COLUMN estado boolean;  

    ALTER TABLE public.tipotransaccion
    ADD COLUMN estado boolean;
--12/03/2024------
    ALTER TABLE public.comision
    DROP COLUMN desde, 
    DROP COLUMN hasta;
    ----16-03-2024----

    CREATE TABLE encabezadoarqueo (
            id_encabezadoarqueo SERIAL PRIMARY KEY,
            caja_id INT,
            usuario_id INT,
            comentario TEXT,
            estado BOOLEAN,
            entidadbancaria_id INT,
            fechacreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fechamodificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            FOREIGN KEY (entidadbancaria_id) REFERENCES entidadbancaria(id_entidadbancaria)
    );
     CREATE TABLE detallearqueo (
            id_detalle_arqueo SERIAL PRIMARY KEY,
            tipodinero VARCHAR(50),
            valor numeric(10,2),
            cantidad integer,
            usuario_id INT,
            estado BOOLEAN,
            encabezadoarqueo_id int,            
            entidadbancaria_id INT,
            fechacreacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            fechamodificacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (usuario_id) REFERENCES usuario(id_usuario),
            FOREIGN KEY (encabezadoarqueo_id) REFERENCES encabezadoarqueo(id_encabezadoarqueo)
            FOREIGN KEY (entidadbancaria_id) REFERENCES entidadbancaria(id_entidadbancaria)
    );
    ------2024-03-21-----
    ALTER TABLE public.saldos
    ADD COLUMN operacion_id integer,
    ADD CONSTRAINT operacion_id_fkey FOREIGN KEY (operacion_id) REFERENCES public.operaciones(operacion_id);


ALTER TABLE public.operaciones
    ADD COLUMN id_usuario integer,
    ADD CONSTRAINT operaciones_id_usuario_fkey FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario);


-- 2024-03-21 TRIGE QUE ACTUALIZA SALDO--
--DROP TRIGGER IF EXISTS trigger_agregaSaldo ON operaciones;

CREATE OR REPLACE FUNCTION agregaSaldo()
RETURNS TRIGGER AS
$$
DECLARE
    v_id_tipotransaccion INTEGER;
    v_valor NUMERIC(10,2);
    v_afectacaja_id INTEGER;
    v_afectacuenta_id INTEGER;
    v_entidadbancaria_id INTEGER;
BEGIN
    -- Obtener el id_tipotransaccion, valor y entidadbancaria_id de la inserción en la tabla operaciones
    v_id_tipotransaccion := NEW.id_tipotransaccion;
    v_valor := NEW.valor;
    v_entidadbancaria_id := NEW.id_entidadbancaria;

    -- Obtener los valores de afectacaja_id y afectacuenta_id de la tabla tipotransaccion
    SELECT afectacaja_id, afectacuenta_id INTO v_afectacaja_id, v_afectacuenta_id
    FROM tipotransaccion
    WHERE id_tipotransaccion = v_id_tipotransaccion;

    -- Validar si se pudo obtener el id_tipotransaccion, valor y entidadbancaria_id
    IF v_id_tipotransaccion IS NULL OR v_valor IS NULL OR v_entidadbancaria_id IS NULL THEN
        RAISE NOTICE 'No se pudo obtener el id_tipotransaccion, el valor o la entidadbancaria_id de la inserción en la tabla operaciones.';
        RETURN NULL;
    END IF;

    -- Verificar si ya existe un registro en la tabla saldos para la entidad bancaria
    PERFORM 1 FROM saldos WHERE entidadbancaria_id = v_entidadbancaria_id LIMIT 1;

    -- Realizar la actualización o inserción en la tabla saldos dependiendo de si ya existe un registro para la entidad bancaria
    IF FOUND THEN
        -- Actualizar los valores de saldocuenta y saldocaja para la entidad bancaria existente
        UPDATE saldos
        SET saldocuenta = saldocuenta + CASE WHEN v_afectacuenta_id = 1 THEN v_valor ELSE -v_valor END,
            saldocaja = saldocaja + CASE WHEN v_afectacaja_id = 1 THEN v_valor ELSE -v_valor END
        WHERE entidadbancaria_id = v_entidadbancaria_id;
    ELSE
        -- Insertar un nuevo registro en la tabla saldos para la entidad bancaria
        INSERT INTO saldos (saldocuenta, saldocaja, entidadbancaria_id)
        VALUES (CASE WHEN v_afectacuenta_id = 1 THEN v_valor ELSE -v_valor END,
                CASE WHEN v_afectacaja_id = 1 THEN v_valor ELSE -v_valor END,
                v_entidadbancaria_id);
    END IF;

    RETURN NEW;
END;
$$
LANGUAGE plpgsql;

-- Reemplazar el trigger existente con el nuevo trigger modificado
DROP TRIGGER IF EXISTS trigger_agregaSaldo ON operaciones;

CREATE TRIGGER trigger_agregaSaldo
AFTER INSERT ON operaciones
FOR EACH ROW
EXECUTE FUNCTION agregaSaldo();


-----actualizacion 23/03/2024

ALTER TABLE entidadbancaria
ALTER COLUMN sobregiro TYPE numeric(10,2);

---------
CREATE TABLE IF NOT EXISTS public.permisos
(
    id_permiso SERIAL PRIMARY KEY,
    id_rol INTEGER,
    id_usuario INTEGER,
    entidad VARCHAR(255),
    accion VARCHAR(50),
    permitido BOOLEAN,
    FOREIGN KEY (id_rol) REFERENCES rol(id_rol),
    FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario)
);

---27-03-2024
-- Actualizar la relación en la tabla operaciones cambiando id_cliente por id_persona de la tabla persona
ALTER TABLE public.operaciones
DROP CONSTRAINT operaciones_id_cliente_fkey, -- Eliminar la clave externa existente de id_cliente
ADD COLUMN id_persona INT, -- Agregar la nueva columna id_persona
ADD CONSTRAINT operaciones_id_persona_fkey FOREIGN KEY (id_persona) REFERENCES public.persona(id_persona); -- Establecer la nueva clave externa de id_persona


-- Eliminar la columna id_cliente ahora que se ha actualizado la relación
ALTER TABLE public.operaciones
DROP COLUMN id_cliente;

DROP TABLE IF EXISTS public.cliente;

---28-03-2024
--ACTULIZACION DE LA TABLA PERMISIOS
ALTER TABLE permisos
ADD CONSTRAINT unique_permisos_id_rol_id_usuario_entidad_accion UNIQUE (id_rol, id_usuario, entidad, accion);



INSERT INTO general.detallecatalogo (catalogo_id, descripcion, valor, ordenvisualizacion, detallecatalogo_id, estado, fechacreacion, fechamodificacion, usuariocreacion_id, usuariomodificacion_id, valoradicional) 
VALUES 
(6, 'PORCENTAJE 15%', '15', 2, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, null, 4),
(6, 'PORCENTAJE 0%', '0', 3, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, null, 0),
(6, 'PORCENTAJE 5%', '5', 4, NULL, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, null, 5);


-- Abril 2 - 2024 --

CREATE TABLE rutavisible (
	id_rutavisible SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuario(id_usuario),
    ruta VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE ruta (
	id_ruta SERIAL PRIMARY KEY,
    nombre VARCHAR(255) NOT NULL
);

ALTER TABLE rutavisible
ADD COLUMN id_ruta INT;

ALTER TABLE rutavisible
DROP COLUMN ruta;

ALTER TABLE rutavisible
ADD CONSTRAINT fk_ruta_id
FOREIGN KEY (id_ruta)
REFERENCES ruta(id_ruta);

-- Renombrar la columna "nombre" a "ruta"
ALTER TABLE ruta RENAME COLUMN nombre TO ruta;

-- Agregar una nueva columna llamada "nombre"
ALTER TABLE ruta ADD COLUMN nombre VARCHAR(255);

ALTER TABLE rutavisible
ADD CONSTRAINT rutavisible_id_usuario_id_ruta_key UNIQUE (id_usuario, id_ruta);

-- Abril 4 - 2024 -- CAMBIOS AL TRIGGER DE SALDOS:

-- FUNCTION: public.agregasaldo()
-- DROP FUNCTION IF EXISTS public.agregasaldo();
CREATE OR REPLACE FUNCTION public.agregasaldo()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
DECLARE
    v_id_tipotransaccion INTEGER;
    v_valor NUMERIC(10,2);
    v_afectacaja_id INTEGER;
    v_afectacuenta_id INTEGER;
    v_entidadbancaria_id INTEGER;
BEGIN
    -- Obtener el id_tipotransaccion, valor y entidadbancaria_id de la inserción en la tabla operaciones
    v_id_tipotransaccion := NEW.id_tipotransaccion;
    v_valor := NEW.valor;
    v_entidadbancaria_id := NEW.id_entidadbancaria;

    -- Obtener los valores de afectacaja_id y afectacuenta_id de la tabla tipotransaccion
    SELECT afectacaja_id, afectacuenta_id INTO v_afectacaja_id, v_afectacuenta_id
    FROM tipotransaccion
    WHERE id_tipotransaccion = v_id_tipotransaccion;

    -- Validar si se pudo obtener el id_tipotransaccion, valor y entidadbancaria_id
    IF v_id_tipotransaccion IS NULL OR v_valor IS NULL OR v_entidadbancaria_id IS NULL THEN
        RAISE NOTICE 'No se pudo obtener el id_tipotransaccion, el valor o la entidadbancaria_id de la inserción en la tabla operaciones.';
        RETURN NULL;
    END IF;

    -- Verificar si ya existe un registro en la tabla saldos para la entidad bancaria
    PERFORM 1 FROM saldos WHERE entidadbancaria_id = v_entidadbancaria_id LIMIT 1;

    -- Realizar la actualización o inserción en la tabla saldos dependiendo de si ya existe un registro para la entidad bancaria
    IF FOUND THEN
	-- Actualizar los valores de saldocuenta y saldocaja para la entidad bancaria existente
	UPDATE saldos
	SET saldocuenta = saldocuenta + CASE 
	                                    WHEN v_afectacuenta_id = 1 THEN v_valor 
	                                    WHEN v_afectacuenta_id = 3 THEN 0 -- No se suma ni se resta nada
	                                    ELSE -v_valor 
	                                END,
	    saldocaja = saldocaja + CASE 
	                                WHEN v_afectacaja_id = 1 THEN v_valor 
	                                WHEN v_afectacaja_id = 3 THEN 0 -- No se suma ni se resta nada
	                                ELSE -v_valor 
	                            END
	WHERE entidadbancaria_id = v_entidadbancaria_id;
    ELSE
		-- Insertar un nuevo registro en la tabla saldos para la entidad bancaria
		INSERT INTO saldos (saldocuenta, saldocaja, entidadbancaria_id)
		VALUES (
		    CASE WHEN v_afectacuenta_id = 1 THEN v_valor 
		         WHEN v_afectacuenta_id = 3 THEN saldocuenta
		         ELSE -v_valor END,
		    CASE WHEN v_afectacaja_id = 1 THEN v_valor 
		         WHEN v_afectacaja_id = 3 THEN saldocaja
		         ELSE -v_valor END,
		    v_entidadbancaria_id
		);
    END IF;

    RETURN NEW;
END;
$BODY$;

ALTER FUNCTION public.agregasaldo()
    OWNER TO postgres;

-- AQUI TERMINA EL TRIGGER DE SALDOS --

-- Abril 5 - 2024 --
-- Añadir la columna id_caja a la tabla operaciones
ALTER TABLE operaciones
ADD COLUMN id_caja integer;

-- Establecer la relación utilizando una clave foránea
ALTER TABLE operaciones
ADD CONSTRAINT fk_id_caja
FOREIGN KEY (id_caja)
REFERENCES caja(id_caja);

-- Actualizado el trigger para que maneje el sobregiro --
-- FUNCTION: public.agregasaldo()

-- DROP FUNCTION IF EXISTS public.agregasaldo();

CREATE OR REPLACE FUNCTION public.agregasaldo()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
DECLARE
    v_id_tipotransaccion INTEGER;
    v_valor NUMERIC(10,2);
    v_afectacaja_id INTEGER;
    v_afectacuenta_id INTEGER;
    v_entidadbancaria_id INTEGER;
    v_caja_id INTEGER;
    v_sobregiro NUMERIC(10,2); -- Variable para almacenar el valor de sobregiro
    v_saldocuenta_actual NUMERIC(10,2); -- Variable para almacenar el saldo actual de la cuenta
BEGIN
    -- Obtener el id_tipotransaccion, valor, entidadbancaria_id y caja_id de la inserción en la tabla operaciones
    v_id_tipotransaccion := NEW.id_tipotransaccion;
    v_valor := NEW.valor;
    v_entidadbancaria_id := NEW.id_entidadbancaria;
    v_caja_id := NEW.id_caja; -- Utilizar id_caja en lugar de caja_id

    -- Obtener los valores de afectacaja_id y afectacuenta_id de la tabla tipotransaccion
    SELECT afectacaja_id, afectacuenta_id INTO v_afectacaja_id, v_afectacuenta_id
    FROM tipotransaccion
    WHERE id_tipotransaccion = v_id_tipotransaccion;

    -- Validar si se pudo obtener el id_tipotransaccion, valor, entidadbancaria_id y caja_id
    IF v_id_tipotransaccion IS NULL OR v_valor IS NULL OR v_entidadbancaria_id IS NULL OR v_caja_id IS NULL THEN
        RAISE NOTICE 'No se pudo obtener el id_tipotransaccion, el valor, la entidadbancaria_id o el id_caja de la inserción en la tabla operaciones.';
        RETURN NULL;
    END IF;

    -- Obtener el valor de sobregiro para la entidad bancaria
    SELECT sobregiro INTO v_sobregiro
    FROM entidadbancaria
    WHERE id_entidadbancaria = v_entidadbancaria_id;

    -- Obtener el saldo actual de la cuenta
    SELECT saldocuenta INTO v_saldocuenta_actual
    FROM saldos
    WHERE entidadbancaria_id = v_entidadbancaria_id AND caja_id = v_caja_id;

    -- Verificar si el valor de la operación excede el saldo actual más el sobregiro permitido
    IF v_saldocuenta_actual + v_valor < -v_sobregiro THEN
        RAISE EXCEPTION 'Operación rechazada: El saldo de la cuenta excede el sobregiro permitido.';
        RETURN NULL;
    END IF;

    -- Verificar si ya existe un registro en la tabla saldos para la entidad bancaria y la caja
    PERFORM 1 FROM saldos WHERE entidadbancaria_id = v_entidadbancaria_id AND caja_id = v_caja_id LIMIT 1;

    -- Realizar la actualización o inserción en la tabla saldos dependiendo de si ya existe un registro para la entidad bancaria y la caja
    IF FOUND THEN
        -- Actualizar los valores de saldocuenta y saldocaja para la entidad bancaria y la caja existente
        UPDATE saldos
        SET saldocuenta = saldocuenta + CASE 
                                            WHEN v_afectacuenta_id = 1 THEN v_valor 
                                            WHEN v_afectacuenta_id = 3 THEN 0 -- No se suma ni se resta nada
                                            ELSE -v_valor 
                                        END,
            saldocaja = saldocaja + CASE 
                                        WHEN v_afectacaja_id = 1 THEN v_valor 
                                        WHEN v_afectacaja_id = 3 THEN 0 -- No se suma ni se resta nada
                                        ELSE -v_valor 
                                    END
        WHERE entidadbancaria_id = v_entidadbancaria_id AND caja_id = v_caja_id;
    ELSE
        -- Insertar un nuevo registro en la tabla saldos para la entidad bancaria y la caja
        INSERT INTO saldos (saldocuenta, saldocaja, entidadbancaria_id, caja_id)
        VALUES (
            CASE WHEN v_afectacuenta_id = 1 THEN v_valor 
                 WHEN v_afectacuenta_id = 3 THEN 0
                 ELSE -v_valor END,
            CASE WHEN v_afectacaja_id = 1 THEN v_valor 
                 WHEN v_afectacaja_id = 3 THEN 0
                 ELSE -v_valor END,
            v_entidadbancaria_id,
            v_caja_id
        );
    END IF;

    RETURN NEW;
END;
$BODY$;

ALTER FUNCTION public.agregasaldo()
    OWNER TO postgres;

-- fin de actualizacion de trigger --

-- Abril 6 - 2024 --  ACTUALIZACION DE LA TABLA OPERACIONES
ALTER TABLE operaciones
DROP CONSTRAINT operaciones_numtransaccion_key;

ALTER TABLE operaciones
ADD CONSTRAINT operaciones_numtransaccion_id_entidadbancaria_key UNIQUE (numtransaccion, id_entidadbancaria);

ALTER TABLE operaciones
DROP CONSTRAINT operaciones_numtransaccion_id_entidadbancaria_key;

CREATE UNIQUE INDEX operaciones_numtransaccion_id_entidadbancaria_key
ON operaciones (numtransaccion, id_entidadbancaria)
WHERE numtransaccion <> '';

-- Abril 8 - 2024 --  ACTUALIZACION DEl TRIGGER --

-- FUNCTION: public.agregasaldo()
-- DROP FUNCTION IF EXISTS public.agregasaldo();
CREATE OR REPLACE FUNCTION public.agregasaldo()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
DECLARE
    v_id_tipotransaccion INTEGER;
    v_valor NUMERIC(10,2);
    v_afectacaja_id INTEGER;
    v_afectacuenta_id INTEGER;
    v_entidadbancaria_id INTEGER;
    v_caja_id INTEGER;
    v_sobregiro NUMERIC(10,2); -- Variable para almacenar el valor de sobregiro
    v_saldocuenta_actual NUMERIC(10,2); -- Variable para almacenar el saldo actual de la cuenta
    v_nuevo_saldo NUMERIC(10,2); -- Variable para almacenar el nuevo saldo después de aplicar la operación
BEGIN
    -- Obtener el id_tipotransaccion, valor, entidadbancaria_id y caja_id de la inserción en la tabla operaciones
    v_id_tipotransaccion := NEW.id_tipotransaccion;
    v_valor := NEW.valor;
    v_entidadbancaria_id := NEW.id_entidadbancaria;
    v_caja_id := NEW.id_caja; -- Utilizar id_caja en lugar de caja_id

    -- Obtener los valores de afectacaja_id y afectacuenta_id de la tabla tipotransaccion
    SELECT afectacaja_id, afectacuenta_id INTO v_afectacaja_id, v_afectacuenta_id
    FROM tipotransaccion
    WHERE id_tipotransaccion = v_id_tipotransaccion;

    -- Validar si se pudo obtener el id_tipotransaccion, valor, entidadbancaria_id y caja_id
    IF v_id_tipotransaccion IS NULL OR v_valor IS NULL OR v_entidadbancaria_id IS NULL OR v_caja_id IS NULL THEN
        RAISE NOTICE 'No se pudo obtener el id_tipotransaccion, el valor, la entidadbancaria_id o el id_caja de la inserción en la tabla operaciones.';
        RETURN NULL;
    END IF;

    -- Obtener el valor de sobregiro para la entidad bancaria
    SELECT sobregiro INTO v_sobregiro
    FROM entidadbancaria
    WHERE id_entidadbancaria = v_entidadbancaria_id;

    -- Obtener el saldo actual de la cuenta
	SELECT saldocuenta INTO v_saldocuenta_actual
	FROM saldos
	WHERE entidadbancaria_id = v_entidadbancaria_id AND caja_id = v_caja_id;
	
	-- Verificar si la consulta no devuelve ninguna fila
	IF NOT FOUND THEN
	    v_saldocuenta_actual := 0.00;
	END IF;


    -- Calcular el nuevo saldo después de aplicar la operación
    v_nuevo_saldo := v_saldocuenta_actual + 
                     CASE 
                         WHEN v_afectacuenta_id = 1 THEN v_valor 
                         WHEN v_afectacuenta_id = 2 THEN -v_valor 
                         ELSE 0 
                     END;

    -- Verificar si el nuevo saldo excede el sobregiro permitido
    IF v_nuevo_saldo < -v_sobregiro THEN
        RAISE EXCEPTION 'Operación rechazada: El saldo de la cuenta excede el sobregiro permitido.';
        RETURN NULL;
    END IF;

    -- Verificar si ya existe un registro en la tabla saldos para la entidad bancaria y la caja
    PERFORM 1 FROM saldos WHERE entidadbancaria_id = v_entidadbancaria_id AND caja_id = v_caja_id LIMIT 1;

    -- Realizar la actualización o inserción en la tabla saldos dependiendo de si ya existe un registro para la entidad bancaria y la caja
    IF FOUND THEN
        -- Actualizar los valores de saldocuenta y saldocaja para la entidad bancaria y la caja existente
        UPDATE saldos
        SET saldocuenta = v_nuevo_saldo,
            saldocaja = saldocaja + CASE 
                                        WHEN v_afectacaja_id = 1 THEN v_valor 
                                        WHEN v_afectacaja_id = 2 THEN -v_valor 
                                        ELSE 0 
                                    END
        WHERE entidadbancaria_id = v_entidadbancaria_id AND caja_id = v_caja_id;
    ELSE
        -- Insertar un nuevo registro en la tabla saldos para la entidad bancaria y la caja
        INSERT INTO saldos (saldocuenta, saldocaja, entidadbancaria_id, caja_id)
        VALUES (
            v_nuevo_saldo,
            CASE WHEN v_afectacaja_id = 1 THEN v_valor 
                 WHEN v_afectacaja_id = 2 THEN -v_valor 
                 ELSE 0 
            END,
            v_entidadbancaria_id,
            v_caja_id
        );
    END IF;

    RETURN NEW;
END;
$BODY$;

ALTER FUNCTION public.agregasaldo()
    OWNER TO postgres;


-- fin de actualizacion de trigger --


-- Abril 9 - 2024 --

-- ACTUALIZACION DE FUNCIONALIDAD PARA LAS OPERACIONES --
CREATE TABLE public.afectacomision
(
    id_afectacomision integer NOT NULL,
    nombre character varying(100),
    valor double precision,
    estado boolean,
    PRIMARY KEY (id_afectacomision)
);

ALTER TABLE IF EXISTS public.afectacomision
    OWNER to postgres;

INSERT INTO public.afectacomision (id_afectacomision, nombre, valor, estado)
VALUES 
    (1, 'SUMA A COMISION', 1, true),
    (2, 'RESTA A COMISION', 2, true),
    (3, 'NO AFECTA A COMISION', 3, true);

ALTER TABLE IF EXISTS public.tipotransaccion
    ADD COLUMN afectacomision_id integer;

UPDATE public.tipotransaccion
SET afectacomision_id = 3;

ALTER TABLE public.tipotransaccion
ADD CONSTRAINT fk_afectacomision
FOREIGN KEY (afectacomision_id)
REFERENCES public.afectacomision (id_afectacomision);

ALTER TABLE caja
ADD COLUMN saldocomision NUMERIC(10,2) DEFAULT 0.00;


ALTER TABLE saldos
DROP COLUMN saldocaja;

ALTER TABLE caja
ADD COLUMN saldocaja NUMERIC(10,2) DEFAULT 0.00;

--------------------------------------------------------------
--------------------------------------------------------------
--------- ACTUALIZACION DEL TRIGGER AGREGARSALDO -------------
--------------------------------------------------------------

-- FUNCTION: public.agregasaldo()

-- DROP FUNCTION IF EXISTS public.agregasaldo();

CREATE OR REPLACE FUNCTION public.agregasaldo()
    RETURNS trigger
    LANGUAGE 'plpgsql'
    COST 100
    VOLATILE NOT LEAKPROOF
AS $BODY$
DECLARE
    v_id_tipotransaccion INTEGER;
    v_valor NUMERIC(10,2);
    v_saldocomision NUMERIC (10,2);
    v_tipodocumento VARCHAR(3);
    v_afectacaja_id INTEGER;
    v_afectacuenta_id INTEGER;
    v_afectacomision_id INTEGER;
    v_caja_id INTEGER;
    v_entidadbancaria_id INTEGER;
    v_saldocuenta_actual NUMERIC(10,2) DEFAULT 0.00;
    v_saldocaja_actual NUMERIC(10,2) DEFAULT 0.00;
    v_saldocomision_actual NUMERIC(10,2) DEFAULT 0.00;
    v_sobregiro NUMERIC(10,2);
    v_new_saldocomision NUMERIC(10,2);
    v_new_saldocaja NUMERIC(10,2);
    v_new_saldocuenta NUMERIC(10,2);
BEGIN
    -- Obtener los datos de la operación
    v_id_tipotransaccion := NEW.id_tipotransaccion;
    v_valor := NEW.valor;
    v_tipodocumento := NEW.tipodocumento;
    v_entidadbancaria_id := NEW.id_entidadbancaria;
    v_caja_id := NEW.id_caja;
    v_saldocomision := NEW.saldocomision;

    -- Obtener valores de afectación de la tabla tipotransaccion
    SELECT afectacaja_id, afectacuenta_id, afectacomision_id INTO v_afectacaja_id, v_afectacuenta_id, v_afectacomision_id
    FROM tipotransaccion
    WHERE id_tipotransaccion = v_id_tipotransaccion;

    -- Obtener el valor de sobregiro para la entidad bancaria
    SELECT COALESCE(sobregiro, 0.00) INTO v_sobregiro
    FROM entidadbancaria
    WHERE id_entidadbancaria = v_entidadbancaria_id;

    -- Intentar obtener el saldo actual de la cuenta y caja
    -- Primero, intenta encontrar el registro existente o inicializar con 0.00 si no se encuentra
    PERFORM 1 FROM saldos WHERE entidadbancaria_id = v_entidadbancaria_id AND caja_id = v_caja_id;
    IF NOT FOUND THEN
        INSERT INTO saldos (entidadbancaria_id, caja_id, saldocuenta)
        VALUES (v_entidadbancaria_id, v_caja_id, 0.00);
        v_saldocuenta_actual := 0.00;
    ELSE
        SELECT COALESCE(saldocuenta, 0.00) INTO v_saldocuenta_actual
        FROM saldos
        WHERE entidadbancaria_id = v_entidadbancaria_id AND caja_id = v_caja_id;
    END IF;

    -- Obtener o inicializar el saldo de comisión y caja actual de la caja
    SELECT COALESCE(saldocomision, 0.00), COALESCE(saldocaja, 0.00) INTO v_saldocomision_actual, v_saldocaja_actual
    FROM caja
    WHERE id_caja = v_caja_id;

    IF NOT FOUND THEN
        INSERT INTO caja (id_caja, saldocomision, saldocaja)
        VALUES (v_caja_id, 0.00, 0.00);
    END IF;

    -- Calcular los nuevos saldos tentativos
    v_new_saldocaja := v_saldocaja_actual + CASE WHEN v_afectacaja_id = 1 THEN v_valor WHEN v_afectacaja_id = 2 THEN -v_valor ELSE 0 END;
    v_new_saldocomision := v_saldocomision_actual + CASE 
    WHEN v_tipodocumento = 'OPR' AND v_afectacomision_id = 1 THEN v_saldocomision 
    WHEN v_tipodocumento = 'OPR' AND v_afectacomision_id = 2 THEN -v_saldocomision 
    WHEN v_tipodocumento = 'MV' AND v_afectacomision_id = 1 THEN v_valor
    WHEN v_tipodocumento = 'MV' AND v_afectacomision_id = 2 THEN -v_valor
    ELSE 0 END;
    v_new_saldocuenta := v_saldocuenta_actual + CASE WHEN v_afectacuenta_id = 1 THEN v_valor WHEN v_afectacuenta_id = 2 THEN -v_valor ELSE 0 END;

    -- Verificar condiciones antes de actualizar
    IF v_new_saldocomision < 0 THEN
        RAISE EXCEPTION 'No hay suficiente saldo de comision.';
    ELSIF v_new_saldocaja < 0 THEN
        RAISE EXCEPTION 'No hay suficiente saldo de caja.';
    ELSIF v_new_saldocuenta < -v_sobregiro THEN
        RAISE EXCEPTION 'Se está excediendo el valor de sobregiro.';
    ELSE
        -- Actualizar la tabla caja para saldocomision y saldocaja
        UPDATE caja
        SET saldocomision = v_new_saldocomision, 
            saldocaja = v_new_saldocaja
        WHERE id_caja = v_caja_id;

        -- Actualizar la tabla saldos para la columna saldocuenta
	UPDATE saldos
	SET saldocuenta = COALESCE(v_new_saldocuenta, 0.00)
	WHERE entidadbancaria_id = v_entidadbancaria_id AND caja_id = v_caja_id;

    END IF;

    RETURN NEW;
END;
$BODY$;

ALTER FUNCTION public.agregasaldo()
    OWNER TO postgres;

-- FIN DE ACTUALIZACION DEL TRIGGER --



-- Abril 10 - 2024 --


ALTER TABLE IF EXISTS public.permisos DROP COLUMN IF EXISTS id_rol;

ALTER TABLE IF EXISTS public.permisos DROP COLUMN IF EXISTS entidad;

ALTER TABLE IF EXISTS public.permisos DROP COLUMN IF EXISTS accion;

ALTER TABLE IF EXISTS public.permisos
    RENAME permitido TO estado;

ALTER TABLE IF EXISTS public.permisos
    ADD COLUMN permiso character varying;

ALTER TABLE IF EXISTS public.permisos DROP COLUMN IF EXISTS permiso;

ALTER TABLE IF EXISTS public.permisos
    ADD COLUMN id_listapermisos integer;    


CREATE TABLE public.listapermisos
(
    id_listapermisos integer NOT NULL,
    nombre character varying,
    PRIMARY KEY (id_listapermisos)
);

ALTER TABLE IF EXISTS public.listapermisos
    OWNER to postgres;


ALTER TABLE permisos
ADD CONSTRAINT fk_listapermisos
FOREIGN KEY (id_listapermisos)
REFERENCES listapermisos (id_listapermisos);


CREATE UNIQUE INDEX idx_permisos_unique ON permisos (id_usuario, id_listapermisos);


ALTER TABLE IF EXISTS public.entidadbancaria
    ADD COLUMN por_cada numeric;