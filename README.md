# Planificador de Traslados

AplicaciÃ³n web para calcular y visualizar la distribuciÃ³n de piezas en carros dentro de una planta industrial.

## Funcionalidades

- CÃ¡lculo automÃ¡tico de carros necesarios y carros completos.
- ComparaciÃ³n entre carros necesarios y disponibles.
- Primera tanda y piezas pendientes cuando faltan carros.
- Capacidades configurables segÃºn el tamaÃ±o de las piezas.
- AsignaciÃ³n de OT individual, editable y persistente para cada carro.
- Registro del nombre de quien carga los datos y de quien transporta el material.
- Guardado temporal de traslados completos en el navegador, preparado para una futura conexiÃ³n con Firebase.
- DragÃ³n asistente con mensajes motivadores periÃ³dicos.
- ValidaciÃ³n de cantidades enteras y capacidades vÃ¡lidas.
- RepresentaciÃ³n visual del nivel de ocupaciÃ³n de cada carro.
- PaginaciÃ³n para traslados con muchos carros.
- DiseÃ±o responsive para escritorio y dispositivos mÃ³viles.

Las capacidades por tamaÃ±o y las OT se guardan localmente en el navegador.

## PreparaciÃ³n para Firebase

CompletÃ¡ las variables de `.env` con la configuraciÃ³n web de tu proyecto Firebase. El archivo real estÃ¡ excluido de Git; `.env.example` sirve como plantilla segura.

## TecnologÃ­as

- React
- Vite
- JavaScript
- Oxlint

## Uso local

```bash
npm install
npm run dev
```

## VerificaciÃ³n

```bash
npm run lint
npm run build
```

