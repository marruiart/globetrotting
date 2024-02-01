export type Strapi = 'Strapi';
export type Firebase = 'Firebase';
export type BackendTypes = Firebase | Strapi;

export type Backend = Strapi;
export const BACKEND: BackendTypes = 'Strapi';

export const environment = {
  production: true,
  backend: BACKEND,
  strapiUrl: "https://globetrotting-service.onrender.com",
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
