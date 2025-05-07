<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Generador de QR para Ubicaciones</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        #miFormulario {
            background: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
        }
        input, textarea {
            width: 100%;
            padding: 10px;
            margin-bottom: 15px;
            border: 1px solid #ddd;
            border-radius: 4px;
        }
        button {
            background-color: #4285f4;
            color: white;
            border: none;
            padding: 12px;
            border-radius: 4px;
            cursor: pointer;
            width: 100%;
        }
        #qrcode {
            text-align: center;
            margin: 20px 0;
            min-height: 256px;
        }
        #qrcode img {
            border: 1px solid #eee;
            padding: 10px;
            background: white;
        }
    </style>
</head>
<body>
    <h1>Generador de QR para Ubicaciones</h1>
    
    <form id="miFormulario">
        <input type="text" name="nombre" placeholder="Nombre del lugar" required>
        <textarea name="descripcion" placeholder="Descripción" rows="3"></textarea>
        <input type="text" name="latitud" placeholder="Latitud (ej: 19.4326)" required>
        <input type="text" name="longitud" placeholder="Longitud (ej: -99.1332)" required>
        <button type="submit">Generar QR</button>
    </form>

    <div id="qrcode">
        <!-- Aquí aparecerá el QR -->
    </div>

    <!-- Cargamos la librería desde CDN -->
    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.1/build/qrcode.min.js"></script>

    <script>
        document.getElementById('miFormulario').addEventListener('submit', function(e) {
            e.preventDefault();
            
            // 1. Obtenemos los datos
            const formData = new FormData(this);
            const datos = {
                nombre: formData.get('nombre'),
                descripcion: formData.get('descripcion'),
                ubicacion: {
                    lat: parseFloat(formData.get('latitud')),
                    lng: parseFloat(formData.get('longitud'))
                },
                fecha: new Date().toISOString()
            };

            // 2. Validamos coordenadas
            if (isNaN(datos.ubicacion.lat) || isNaN(datos.ubicacion.lng)) {
                alert("¡Las coordenadas deben ser números válidos!");
                return;
            }

            // 3. Limpiamos el contenedor anterior
            const qrContainer = document.getElementById('qrcode');
            qrContainer.innerHTML = '';

            // 4. Generamos el QR (versión más robusta)
            QRCode.toDataURL(JSON.stringify(datos), {
                width: 300,
                margin: 2,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            }, function(err, url) {
                if (err) {
                    console.error("Error generando QR:", err);
                    qrContainer.innerHTML = '<p style="color:red">Error al generar QR</p>';
                    return;
                }
                
                // Mostramos la imagen del QR
                const img = document.createElement('img');
                img.src = url;
                img.alt = "Código QR de la ubicación";
                qrContainer.appendChild(img);

                // Agregamos botón de descarga
                const downloadBtn = document.createElement('button');
                downloadBtn.textContent = 'Descargar QR';
                downloadBtn.style.marginTop = '10px';
                downloadBtn.onclick = function() {
                    const link = document.createElement('a');
                    link.download = `qr-${datos.nombre.replace(/[^a-z0-9]/gi, '_')}.png`;
                    link.href = url;
                    link.click();
                };
                qrContainer.appendChild(downloadBtn);
            });
        });
    </script>
</body>
</html>