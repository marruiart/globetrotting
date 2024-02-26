// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export type Strapi = 'Strapi';
export type Firebase = 'Firebase';
export type BackendTypes = Firebase | Strapi;

export type Backend = Firebase;
export const BACKEND: BackendTypes = 'Firebase';

export const environment = {
  production: false,
  backend: BACKEND,
  strapiUrl: "http://localhost:1337",
  apiUrl: "https://rickandmortyapi.com/api",
  apiUpdate: false,
  firebaseConfig: {
    apiKey: "AIzaSyAHJl1sh0WVzkgT_DCLRFiGoTn29_Vudg4",
    authDomain: "globetrotting-80e83.firebaseapp.com",
    projectId: "globetrotting-80e83",
    storageBucket: "globetrotting-80e83.appspot.com",
    messagingSenderId: "890217120061",
    appId: "1:890217120061:web:c839398ffc31a2ed260554"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
