-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 29-07-2025 a las 01:07:27
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `centinelapp`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comunicados`
--

CREATE TABLE `comunicados` (
  `id_comunicado` int(11) NOT NULL,
  `titulo` varchar(40) NOT NULL,
  `contenido` varchar(2000) NOT NULL,
  `fecha_publicacion` date NOT NULL,
  `fecha_expiracion` date NOT NULL,
  `fecha_actualizacion` datetime NOT NULL,
  `prioridad` enum('importante','medio') NOT NULL,
  `empleado_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

--
-- Volcado de datos para la tabla `comunicados`
--

INSERT INTO `comunicados` (`id_comunicado`, `titulo`, `contenido`, `fecha_publicacion`, `fecha_expiracion`, `fecha_actualizacion`, `prioridad`, `empleado_id`) VALUES
(44, 'FULL EN PATÍO', 'Buen día\r\n\r\nSe les comunica que está prohibido que unidades externas desenganchen en patío de maniobras.\r\n*Las unidades deberán desenganchar en las partes exteriores a Networks.', '2025-07-10', '2025-08-27', '2025-07-10 10:16:19', 'importante', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `empleado`
--

CREATE TABLE `empleado` (
  `id_empleado` int(11) NOT NULL,
  `nombre` varchar(45) NOT NULL,
  `apellido` varchar(45) NOT NULL,
  `puesto` varchar(45) NOT NULL,
  `telefono` varchar(15) NOT NULL,
  `estado` enum('Activo','Bloqueado','Suspendido') NOT NULL,
  `rol_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

--
-- Volcado de datos para la tabla `empleado`
--

INSERT INTO `empleado` (`id_empleado`, `nombre`, `apellido`, `puesto`, `telefono`, `estado`, `rol_id`) VALUES
(1, 'Edgar', 'Castelan', 'Jefe Seguridad', '4421366987', 'Activo', 1),
(50, 'Marco', 'Rodríguez ', 'Vigilancia', '4423305428', 'Activo', 3),
(53, 'Juan', 'Rivera', 'Vigilancia', '4424744548', 'Activo', 3);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `incidencia`
--

CREATE TABLE `incidencia` (
  `id_incidencia` int(11) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `fecha` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `foto` varchar(255) NOT NULL,
  `riesgo` enum('Bajo','Medio','Alto') NOT NULL,
  `ubicacion_id` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `reporte_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `reporte`
--

CREATE TABLE `reporte` (
  `id_reporte` int(11) NOT NULL,
  `empleado_id` int(11) NOT NULL,
  `ubicacion_id` int(11) NOT NULL,
  `rondin_id` int(11) NOT NULL,
  `observacion` varchar(255) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp(),
  `imagen` varchar(255) DEFAULT NULL,
  `ciclo_id` bigint(20) NOT NULL DEFAULT 0,
  `estatus` varchar(20) NOT NULL DEFAULT 'Pendiente',
  `fecha_escaneo` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rol`
--

CREATE TABLE `rol` (
  `id_rol` int(11) NOT NULL,
  `nombre_rol` varchar(35) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_spanish2_ci;

--
-- Volcado de datos para la tabla `rol`
--

INSERT INTO `rol` (`id_rol`, `nombre_rol`) VALUES
(1, 'Administrador'),
(3, 'Guardia');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rondin`
--

CREATE TABLE `rondin` (
  `id_rondin` int(11) NOT NULL,
  `nombre` varchar(255) NOT NULL,
  `descripcion` varchar(255) NOT NULL,
  `estado` enum('Activa','Suspendida','Bloqueada') NOT NULL,
  `hora_inicio` time NOT NULL,
  `hora_fin` time NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `rutas_rondin`
--

CREATE TABLE `rutas_rondin` (
  `id_ruta` int(11) NOT NULL,
  `rondin_id` int(11) DEFAULT NULL,
  `ubicacion_id` int(11) DEFAULT NULL,
  `orden` int(11) DEFAULT NULL,
  `modificado` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ubicacion`
--

CREATE TABLE `ubicacion` (
  `id_ubicacion` int(11) NOT NULL,
  `nombre` varchar(55) NOT NULL,
  `latitud` double NOT NULL,
  `longitud` double NOT NULL,
  `descripcion` varchar(200) NOT NULL,
  `estado` enum('Activa','Suspendida','Bloqueada','') NOT NULL,
  `qr_path` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ubicacion`
--

INSERT INTO `ubicacion` (`id_ubicacion`, `nombre`, `latitud`, `longitud`, `descripcion`, `estado`, `qr_path`) VALUES
(41, 'Caseta Oriente Inicio', 20.598, -100.4581, 'Caseta de entrada a oficina', 'Activa', 'centinela/assets/qrcodes/qr_41.png'),
(42, 'Cuarto de Bombas', 20.5989, -100.4578, 'Cuarto de bombas junto a entrada de oficinas', 'Activa', 'centinela/assets/qrcodes/qr_42.png'),
(43, 'Checador Seguridad', 20.5985, -100.458, 'Checador junto a oficina de seguridad patrimonial', 'Activa', 'centinela/assets/qrcodes/qr_43.png'),
(44, 'Cortina F1', 20.5989, -100.4583, 'Cortina dentro de Bodega 1', 'Activa', 'centinela/assets/qrcodes/qr_44.png'),
(45, 'Cortina F3', 20.5989, -100.4593, 'Cortina dentro de Bodega 1', 'Activa', 'centinela/assets/qrcodes/qr_45.png'),
(46, 'Muro División B1', 20.5986, -100.4599, 'QR en muro división B1 en extintor', 'Activa', 'centinela/assets/qrcodes/qr_46.png'),
(47, 'Cortina F6', 20.5988, -100.4606, 'Cortina dentro de Extensión B1', 'Activa', 'centinela/assets/qrcodes/qr_47.png'),
(48, 'Entrada ampliación B1', 20.5987, -100.4615, 'Entrada a Extensión B1 ', 'Activa', 'centinela/assets/qrcodes/qr_48.png'),
(49, 'Salida Basurero', 20.5982, -100.4625, 'Salida hacia basurero en extensión B1', 'Activa', 'centinela/assets/qrcodes/qr_49.png'),
(50, 'Esquina extensión B1', 20.5982, -100.4615, 'Esquina de extensión B1 contra esquina de entrada', 'Activa', 'centinela/assets/qrcodes/qr_50.png'),
(51, 'Salida Diesel', 20.5982, -100.4613, 'Salida hacia tanque diesel', 'Activa', 'centinela/assets/qrcodes/qr_51.png'),
(52, 'Mezanine 6', 20.5983, -100.4593, 'Mezanine 6', 'Activa', 'centinela/assets/qrcodes/qr_52.png'),
(53, 'Mezanine 8', 20.5983, -100.4587, 'Mezanine 8', 'Activa', 'centinela/assets/qrcodes/qr_53.png'),
(54, 'Caseta Oriente Fin', 20.598, -100.4581, 'Caseta Oriente Fin', 'Activa', 'centinela/assets/qrcodes/qr_54.png'),
(55, 'Entrada Recepción', 20.5983, -100.458, 'Entrada del edificio', 'Activa', 'centinela/assets/qrcodes/qr_55.png'),
(56, 'Servicio Medico', 20.5982, -100.4581, 'Frente a la puerta de servicio medico', 'Activa', 'centinela/assets/qrcodes/qr_56.png'),
(57, 'Entrada Ofi Admin', 20.5982, -100.4581, 'Junto a la puerta de administración', 'Activa', 'centinela/assets/qrcodes/qr_57.png'),
(58, 'Terraza Dirección', 20.5982, -100.4582, 'Al fondo de la terraza de 3er piso', 'Activa', 'centinela/assets/qrcodes/qr_58.png'),
(59, 'Primera Reja Perimetral Cuchilla', 20.5989, -100.4576, 'Primera reja perimetral', 'Activa', 'centinela/assets/qrcodes/qr_59.png'),
(60, 'Ultima Reja Perimetral Cuchilla', 20.5987, -100.4553, 'Ultima Reja Perimetral Cuchilla', 'Activa', 'centinela/assets/qrcodes/qr_60.png'),
(61, 'Esquina Malla Rama Frenado', 20.5991, -100.4552, 'Esquina Malla Rama Frenado', 'Activa', 'centinela/assets/qrcodes/qr_61.png'),
(62, 'Cortina F4', 20.598933, -100.459103, 'Cortina F4', 'Activa', 'centinela/assets/qrcodes/qr_62.png'),
(63, 'Ingreso Área de Residuos por Andenes', 20.5988, -100.46248, 'Ingreso callejo de basurero por andenes', 'Activa', 'centinela/assets/qrcodes/qr_63.png'),
(64, 'Salchicha de Gas', 20.598541, -100.461483, 'Salchicha de Gas', 'Activa', 'centinela/assets/qrcodes/qr_64.png'),
(65, 'Caseta Poniente', 20.598006, -100.462453, 'Caseta poniente', 'Activa', 'centinela/assets/qrcodes/qr_65.png'),
(66, 'Entrada de Taller', 20.59777, -100.460545, 'Entrada de taller por mantenimiento', 'Activa', 'centinela/assets/qrcodes/qr_66.png'),
(67, 'Entrada Callejón B2', 20.59785, -100.460336, 'Entrada Callejón B2', 'Activa', 'centinela/assets/qrcodes/qr_67.png'),
(68, 'Final de Callejon B2', 20.597435, -100.457961, 'Final de Callejon B2', 'Activa', 'centinela/assets/qrcodes/qr_68.png'),
(69, 'Entrada a Andenes Ferroviarios', 20.598948, -100.457964, 'Entrada a Andenes Ferroviarios', 'Activa', 'centinela/assets/qrcodes/qr_69.png'),
(70, 'Exterior Malla F4', 20.59888, -100.459694, 'Punto frente al Anden ferroviafrio numero 4', 'Activa', 'centinela/assets/qrcodes/qr_70.png'),
(71, 'Esquina Perimetro Poniente', 20.598865, -100.462478, 'Esquina Perimetro Poniente', 'Activa', 'centinela/assets/qrcodes/qr_71.png'),
(72, 'Caseta Central', 20.598134, -100.459889, 'Caseta Central', 'Activa', 'centinela/assets/qrcodes/qr_72.png');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id_usuario` int(11) NOT NULL,
  `usuario` varchar(25) NOT NULL,
  `contraseña` varchar(45) NOT NULL,
  `empleado_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id_usuario`, `usuario`, `contraseña`, `empleado_id`) VALUES
(1, 'Edgar', 'ECM@202506', 1),
(14, 'MarcoR', '12345', 50),
(17, 'JuanR', '12345', 53);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `comunicados`
--
ALTER TABLE `comunicados`
  ADD PRIMARY KEY (`id_comunicado`),
  ADD KEY `empleado_idx` (`empleado_id`);

--
-- Indices de la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD PRIMARY KEY (`id_empleado`),
  ADD KEY `rol_idx` (`rol_id`);

--
-- Indices de la tabla `incidencia`
--
ALTER TABLE `incidencia`
  ADD PRIMARY KEY (`id_incidencia`),
  ADD KEY `ubicacion_idx` (`ubicacion_id`),
  ADD KEY `empleado_idx` (`empleado_id`),
  ADD KEY `reporte_idx` (`reporte_id`);

--
-- Indices de la tabla `reporte`
--
ALTER TABLE `reporte`
  ADD PRIMARY KEY (`id_reporte`),
  ADD KEY `ubicacion_idx` (`ubicacion_id`),
  ADD KEY `empleado_idx` (`empleado_id`),
  ADD KEY `rondin_idx` (`rondin_id`);

--
-- Indices de la tabla `rol`
--
ALTER TABLE `rol`
  ADD PRIMARY KEY (`id_rol`);

--
-- Indices de la tabla `rondin`
--
ALTER TABLE `rondin`
  ADD PRIMARY KEY (`id_rondin`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `rutas_rondin`
--
ALTER TABLE `rutas_rondin`
  ADD PRIMARY KEY (`id_ruta`),
  ADD KEY `rondin_id` (`rondin_id`),
  ADD KEY `ubicacion_id` (`ubicacion_id`);

--
-- Indices de la tabla `ubicacion`
--
ALTER TABLE `ubicacion`
  ADD PRIMARY KEY (`id_ubicacion`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD KEY `empleado_idx` (`empleado_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `comunicados`
--
ALTER TABLE `comunicados`
  MODIFY `id_comunicado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT de la tabla `empleado`
--
ALTER TABLE `empleado`
  MODIFY `id_empleado` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=69;

--
-- AUTO_INCREMENT de la tabla `incidencia`
--
ALTER TABLE `incidencia`
  MODIFY `id_incidencia` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `reporte`
--
ALTER TABLE `reporte`
  MODIFY `id_reporte` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=614;

--
-- AUTO_INCREMENT de la tabla `rol`
--
ALTER TABLE `rol`
  MODIFY `id_rol` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `rondin`
--
ALTER TABLE `rondin`
  MODIFY `id_rondin` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;

--
-- AUTO_INCREMENT de la tabla `rutas_rondin`
--
ALTER TABLE `rutas_rondin`
  MODIFY `id_ruta` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=498;

--
-- AUTO_INCREMENT de la tabla `ubicacion`
--
ALTER TABLE `ubicacion`
  MODIFY `id_ubicacion` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=33;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `comunicados`
--
ALTER TABLE `comunicados`
  ADD CONSTRAINT `comunicados_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleado` (`id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `empleado`
--
ALTER TABLE `empleado`
  ADD CONSTRAINT `empleado_ibfk_1` FOREIGN KEY (`rol_id`) REFERENCES `rol` (`id_rol`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `incidencia`
--
ALTER TABLE `incidencia`
  ADD CONSTRAINT `incidencia_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleado` (`id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `incidencia_ibfk_2` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicacion` (`id_ubicacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `incidencia_ibfk_3` FOREIGN KEY (`reporte_id`) REFERENCES `reporte` (`id_reporte`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `reporte`
--
ALTER TABLE `reporte`
  ADD CONSTRAINT `reporte_ibfk_1` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicacion` (`id_ubicacion`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reporte_ibfk_2` FOREIGN KEY (`empleado_id`) REFERENCES `empleado` (`id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `reporte_ibfk_3` FOREIGN KEY (`rondin_id`) REFERENCES `rondin` (`id_rondin`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Filtros para la tabla `rutas_rondin`
--
ALTER TABLE `rutas_rondin`
  ADD CONSTRAINT `rutas_rondin_ibfk_1` FOREIGN KEY (`rondin_id`) REFERENCES `rondin` (`id_rondin`),
  ADD CONSTRAINT `rutas_rondin_ibfk_2` FOREIGN KEY (`ubicacion_id`) REFERENCES `ubicacion` (`id_ubicacion`);

--
-- Filtros para la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_ibfk_1` FOREIGN KEY (`empleado_id`) REFERENCES `empleado` (`id_empleado`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
