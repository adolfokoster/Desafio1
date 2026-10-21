# Planificador de Traslados

Aplicación web para calcular y visualizar la distribución de piezas en carros dentro de una planta industrial.

## Funcionalidades

- Cálculo automático de carros necesarios y carros completos.
- Comparación entre carros necesarios y disponibles.
- Primera tanda y piezas pendientes cuando faltan carros.
- Capacidades configurables según el tamaño de las piezas.
- Asignación de OT individual, editable y persistente para cada carro.
- Registro del nombre de quien carga los datos y de quien transporta el material.
- Guardado temporal de traslados completos en el navegador, preparado para una futura conexión con Firebase.
- Dragón asistente con mensajes motivadores periódicos.
- Validación de cantidades enteras y capacidades válidas.
- Representación visual del nivel de ocupación de cada carro.
- Paginación para traslados con muchos carros.
- Diseño responsive para escritorio y dispositivos móviles.

Las capacidades por tamaño y las OT se guardan localmente en el navegador.

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
