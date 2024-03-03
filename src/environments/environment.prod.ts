export type Strapi = 'Strapi';
export type Firebase = 'Firebase';
export type BackendTypes = Firebase | Strapi;

export type Backend = Firebase;
export const BACKEND: BackendTypes = 'Firebase';

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
  },
  adminConfig: {
    apiKey: "AIzaSyAHJl1sh0WVzkgT_DCLRFiGoTn29_Vudg4",
    authDomain: "globetrotting-80e83.firebaseapp.com",
    projectId: "globetrotting-80e83",
    storageBucket: "globetrotting-80e83.appspot.com",
    messagingSenderId: "890217120061",
    appId: "1:890217120061:web:d170ae38db55fe4a260554"
  },
  mapsApiKey:"AIzaSyDT2eugs04AIhnAGjhWZwv94CQfxLRl8d4"
};
