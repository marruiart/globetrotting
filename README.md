# Globetrotting

Este proyecto unifica todos los contenidos correspondientes a la formación inicial en Angular que se realiza durante el primer y segundo trimestre de segundo curso de Desarrollo de Aplicaciones Multiplataforma. 

## Descripción

Globetrotting es una aplicación Angular que permite a usuarios registrados como clientes realizar reservas en la agencia de viajes y gestionar sus reservas. Los usuarios registrados como agentes de viajes tienen la capacidad de confirmar reservas existentes, crear nuevas y administrar destinos. Los usuarios registrados como administradores pueden gestionar los usuarios que son agentes de viajes y las mismas funciones que tienen estos.

## Demostración

Para ver una demostración de la aplicación y entender las diferentes acciones que se pueden realizar, consulta este [enlace](https://www.youtube.com/watch?v=rMMr0vFxJJE).

## Tecnologías Utilizadas

### FrontEnd
- Angular
- PrimeNG
- Ionic-Capacitor

### BackEnd
- Strapi (no disponible actualmente en el despliegue público)
- Render (alojamiento de la aplicación web con Strapi y Cloudinary)
- Firebase (base de datos no relacional)
- Google Authenticator (registro de usuarios)
- Google Cloud Functions (endpoint para la descarga de un archivo CSV)
- Netlify (despliegue de la Aplicación web)

La aplicación se encuentra desplegada públicamente en [Netlify](https://stately-pasca-b97506.netlify.app), y el backend está publicado usando Render.

## Estructura de la Aplicación

### Núcleo de la Aplicación
Se ha creado un núcleo en la aplicación llamado `core`, donde se han añadido servicios y utilidades que no dependen de un módulo y pueden ser importados desde cualquier sitio. En este núcleo se gestiona el sistema Redux de NgRx, manteniendo el estado de la aplicación actualizado en todo momento. Contiene además las guardas, que evitan el acceso a zonas privadas de la página a la que solo tienen acceso administradores y/o agentes de viajes. 

### Módulos
Cada página es un módulo independiente. Se ha creado un módulo compartido llamado `SharedModule` que contiene componentes, directivas y pipes utilizables en otros módulos.

### Servicios

#### Autenticación
Se ha implementado un servicio de autenticación con opciones para login, logout y registro.

#### Acceso a Datos
Se ha creado un servicio por cada modelo de datos de la base de datos con métodos CRUD asociados a dicho modelo.

#### ApiService
Un servicio que contiene la lógica necesaria para comunicarse con el backend. En el caso de la web desplegada, firebase, pero también preparado para conectarse a los endpoints de la API de Strapi.

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

#### Página de inicio (landing page / home page)
![image](https://github.com/marruiart/globetrotting/assets/88201067/5d985928-e559-428f-9958-40ab6455420a)
#### Página de destinos 
Vista de cliente:
![image](https://github.com/marruiart/globetrotting/assets/88201067/2a4764f5-6cd8-45ed-85c2-cacdeb73eaf7)
#### Página 'sobre mí'
![image](https://github.com/marruiart/globetrotting/assets/88201067/f5b5c12c-4990-49be-bf53-e8a3cc6a78a5)
#### Perfil de usuario
![image](https://github.com/marruiart/globetrotting/assets/88201067/01523187-5cf3-4c5a-98e9-55f0ffecad85)
#### Página de 'mis reservas'
![image](https://github.com/marruiart/globetrotting/assets/88201067/2f9a3e43-e802-4877-a2e8-1dec66f21d6b)
#### Página de panel de agentes de viajes y administradores
![image](https://github.com/marruiart/globetrotting/assets/88201067/05f0cd39-599d-40bf-887d-27c582aa5e29)
#### Gestión de destinos (administradores y agentes de viajes)
![image](https://github.com/marruiart/globetrotting/assets/88201067/3161a0d3-586d-4a2d-b70e-31ec904e19f4)
#### Gestión de agentes de viajes (solo administrador)
![image](https://github.com/marruiart/globetrotting/assets/88201067/0be832aa-68ba-4d4b-8915-07b37fd738d9)




