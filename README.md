# Planificador de Traslados

Aplicación web para calcular y visualizar la distribución de piezas en carros dentro de una planta industrial.

## Funcionalidades

- Cálculo automático de carros necesarios y carros completos.
- Comparación entre carros necesarios y disponibles.
- Primera tanda y piezas pendientes cuando faltan carros.
- Capacidades configurables según el tamaño de las piezas.
- Asignación de OT individual, editable y persistente para cada carro.
- Registro del nombre de quien carga los datos y de quien transporta el material.
- Acceso seguro con una cuenta de Google mediante Firebase Authentication.
- Dragón asistente con mensajes motivadores periódicos.
- Validación de cantidades enteras y capacidades válidas.
- Representación visual del nivel de ocupación de cada carro.
- Paginación para traslados con muchos carros.
- Diseño responsive para escritorio y dispositivos móviles.
- Registro de responsables y guardado de estimaciones en Cloud Firestore.
- Historial privado con las últimas 50 estimaciones de cada usuario.
- Exportación del historial a un archivo Excel (`.xlsx`) con datos operativos y responsables.

Las capacidades y las OT se guardan localmente. Cada estimación se sincroniza con la subcolección privada `users/{uid}/estimations` de Cloud Firestore.

## Configuración de Firebase

1. Copiá `.env.example` como `.env`.
2. Completá las variables `VITE_FIREBASE_*` con la configuración de la aplicación web de Firebase.
3. Configurá las mismas variables en el entorno de producción de Vercel.
4. Habilitá el proveedor Google en Firebase Authentication y autorizá los dominios local y de Vercel.
5. Publicá las reglas de `firestore.rules`.

El archivo `firestore.rules` exige autenticación y limita cada lectura y creación al UID propietario. Las modificaciones y eliminaciones desde el cliente permanecen bloqueadas.

Las variables con prefijo `VITE_` forman parte del código cliente compilado. No agregues claves privadas ni credenciales de cuentas de servicio.

## Preparación para Firebase

Completá las variables de `.env` con la configuración web de tu proyecto Firebase. El archivo real está excluido de Git; `.env.example` sirve como plantilla segura.

## Tecnologías

- React
- Vite
- JavaScript
- Oxlint

## Uso local

```bash
npm install
npm run dev
```

## Verificación

```bash
npm run lint
npm run build
```
