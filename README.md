# Globetrotting

Este proyecto unifica todos los contenidos correspondientes a la formación inicial en Angular que se realiza durante el primer trimestre de segundo curso de Desarrollo de Aplicaciones Multiplataforma. 

## Descripción

Globetrotting es una aplicación Angular que permite a usuarios registrados como clientes realizar reservas en la agencia de viajes y gestionar sus reservas. Los usuarios registrados como agentes de viajes tienen la capacidad de confirmar reservas existentes, crear nuevas y administrar destinos. Los usuarios registrados como administradores pueden gestionar los usuarios que son agentes de viajes y las mismas funciones que tienen estos.

## Demostración

Para ver una demostración de la aplicación y entender las diferentes acciones que se pueden realizar, consulta este [enlace](https://youtu.be/vboM-cc44aI).

## Tecnologías Utilizadas

### FrontEnd
- Angular
- PrimeNG
- Capacitor

### BackEnd
- Strapi desplegado de forma pública en la red
- PostgreSQL
- Cloudinary

La aplicación se encuentra desplegada públicamente en [Netlify](https://stately-pasca-b97506.netlify.app), y el backend está publicado usando Render.

## Estructura de la Aplicación

### Núcleo de la Aplicación
Se ha creado un núcleo en la aplicación llamado `core`, donde se han añadido servicios y utilidades que no dependen de un módulo y pueden ser importados desde cualquier sitio.

### Módulos
Cada página es un módulo independiente. Se ha creado un módulo compartido llamado `SharedModule` que contiene componentes, directivas y pipes utilizables en otros módulos.

### Servicios

#### Autenticación
Se ha implementado un servicio de autenticación con opciones para login, logout y registro.

#### Acceso a Datos
Se ha creado un servicio por cada modelo de datos de la base de datos con métodos CRUD asociados a dicho modelo.

#### ApiService
Un servicio que contiene la lógica necesaria para comunicarse con el backend (en este caso, los endpoints de la API de Strapi).

#### HttpClientWebProvider
Un servicio de HTTP para el navegador que envuelve las llamadas a HttpClient.

#### JwtService
Un servicio para manejar los tokens JWT necesarios para el acceso a métodos privados de Strapi.

#### TranslateService
Se hace uso del servicio incluido en el paquete `@ngx-translate/core` para manejar el idioma seleccionado en la aplicación.

### Directivas
Se ha creado una directiva personalizada y se han utilizado varias directivas proporcionadas por Angular, como `ngIf` y `ngFor`.

### Pipes
Se han creado pipes personalizados y se han utilizado otros pipes proporcionados por Angular, como `uppercase`, `translate`, `date`, entre otros.

### Componentes, Formularios Reactivos, Modales y Páginas
La aplicación contiene componentes para las páginas, formularios reactivos para editar o añadir datos y diversas páginas, incluyendo páginas de login, registro, inicio, 'sobre mí' (con información sobre el desarrollador), y una página por cada modelo de datos.

### Enrutamiento y Seguridad
Las páginas están organizadas en el enrutador de la aplicación y aquellas que necesitan autenticación están protegidas mediante dos guardas implementada, una que controla el acceso a zonas de administrador y otras a zonas restringidas para usuarios autenticados.

### Interfaz de Usuario
La app es responsiva y hace uso de los componentes de PrimeNG. El tema de PrimeNG ha sido configurado para ajustar los colores de manera dinámica.
