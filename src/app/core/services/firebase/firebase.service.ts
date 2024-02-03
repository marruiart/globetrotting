import { Inject, Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { initializeApp, getApp, FirebaseApp } from "firebase/app";
import { doc, getDoc, startAfter, setDoc, getFirestore, Firestore, updateDoc, onSnapshot, deleteDoc, DocumentData, Unsubscribe, where, addDoc, collection, getDocs, query, limit, QuerySnapshot, DocumentSnapshot, orderBy } from "firebase/firestore";
import { getStorage, ref, getDownloadURL, uploadBytes, FirebaseStorage } from "firebase/storage";
import { createUserWithEmailAndPassword, signInAnonymously, signOut, signInWithEmailAndPassword, initializeAuth, indexedDBLocalPersistence, Auth } from "firebase/auth";
import { FirebaseDocument, FirebaseStorageFile, FirebaseUserCredential } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { AuthFacade } from '../../+state/auth/auth.facade';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private _app!: FirebaseApp;
  private _db!: Firestore;
  private _auth!: Auth;
  private _webStorage!: FirebaseStorage;

  constructor(
    @Inject('firebase-config') config: any,
    private authFacade: AuthFacade
  ) {
    this.init(config);
  }

  public init(firebaseConfig: any) {
    // Initialize Firebase
    this._app = initializeApp(firebaseConfig);
    this._db = getFirestore(this._app);
    this._webStorage = getStorage(this._app);
    this._auth = initializeAuth(getApp(), { persistence: indexedDBLocalPersistence });
    this._auth.onAuthStateChanged(async user => {
      if (user?.uid && user?.email) {
        this.authFacade.saveUserUid(user.uid);
      } else {
        this.authFacade.logout();
      }
    });
  }

  public fileUpload(blob: Blob, mimeType: string, path: string, prefix: string, extension: string): Promise<FirebaseStorageFile> {
    return new Promise(async (resolve, reject) => {
      if (!this._webStorage || !this._auth)
        reject({
          msg: "Not connected to FireStorage"
        });
      var freeConnection = false;
      if (this._auth && !this._auth.currentUser) {
        try {
          await signInAnonymously(this._auth);
          freeConnection = true;
        } catch (error) {
          reject(error);
        }
      }
      const url = path + "/" + prefix + "-" + Date.now() + extension;
      const storageRef = ref(this._webStorage!, url);
      const metadata = {
        contentType: mimeType,
      };
      uploadBytes(storageRef, blob).then(async (snapshot) => {
        getDownloadURL(storageRef).then(async downloadURL => {
          if (freeConnection)
            await signOut(this._auth!);
          resolve({
            path,
            file: downloadURL,
          });
        }).catch(async error => {
          if (freeConnection)
            await signOut(this._auth!);
          reject(error);
        });
      }).catch(async (error) => {
        if (freeConnection)
          await signOut(this._auth!);
        reject(error);
      });
    });
  }

  public imageUpload(blob: Blob): Promise<any> {
    return this.fileUpload(blob, 'image/jpeg', 'images', 'image', ".jpg");
  }

  /**
   * 
   * @param collectionName 
   * @param data 
   * @returns 
   */
  public createDocument(collectionName: string, data: any): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Database is not connected"
        });
      const collectionRef = collection(this._db!, collectionName);
      addDoc(collectionRef, data).then(docRef => resolve(docRef.id)
      ).catch(err => reject(err));
    });
  }

  /**
   * 
   * @param collectionName 
   * @param data 
   * @param docId 
   * @returns 
   */
  public createDocumentWithId(collectionName: string, data: any, docId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this._db) {
        reject({
          msg: 'Database is not connected',
        });
      }
      const docRef = doc(this._db!, collectionName, docId);
      setDoc(docRef, data)
        .then(() => resolve())
        .catch((err) => reject(err));
    });
  }

  /**
   * 
   * @param collectionName 
   * @param document 
   * @param data 
   * @returns 
   */
  public updateDocument(collectionName: string, document: string, data: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Database is not connected"
        });
      const collectionRef = collection(this._db!, collectionName);
      updateDoc(doc(collectionRef, document), data).then(docRef => resolve()
      ).catch(err => reject(err));
    });
  }

  /**
   * 
   * @param collectionName 
   * @returns 
   */
  public getDocuments(collectionName: string, start: DocumentSnapshot | null = null): Promise<QuerySnapshot<DocumentData, DocumentData>> {
    const pageSize = 1;
    return new Promise(async (resolve, reject) => {
      if (!this._db) {
        reject({ msg: "Database is not connected" });
      }
      let docQuery = start ? query(collection(this._db!, collectionName), startAfter(start), limit(pageSize)) : query(collection(this._db!, collectionName), limit(pageSize));
      const querySnapshot = await getDocs(docQuery);
      resolve(querySnapshot);
    });
  }

  /**
   * 
   * @param collectionName 
   * @param document 
   * @returns 
   */
  public getDocument(collectionName: string, document: string): Promise<FirebaseDocument> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Error: Database is not connected."
        });
      const docRef = doc(this._db!, collectionName, document);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        resolve({ id: docSnap.id, data: docSnap.data() });
      } else {
        // doc.data() will be undefined in this case
        reject('Error: Document does not exists.');
      }
    });
  }

  /**
   * 
   * @param collectionName 
   * @param field 
   * @param value 
   * @returns 
   */
  public getDocumentsBy(collectionName: string, field: string, value: any): Promise<FirebaseDocument[]> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Error: Database is not connected."
        });

      const docQuery = query(collection(this._db!, collectionName), where(field, "==", value));
      const querySnapshot = await getDocs(docQuery);
      resolve(querySnapshot.docs.map<FirebaseDocument>(doc => {
        return { id: doc.id, data: doc.data() }
      }));
    });
  }

  /**
   * 
   * @param collectionName 
   * @param docId 
   * @returns 
   */
  public deleteDocument(collectionName: string, docId: string): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Error: Database is not connected."
        });
      resolve(await deleteDoc(doc(this._db!, collectionName, docId)));
    });
  }

  public subscribeToCollection(collectionName: string, subject: BehaviorSubject<any[]>, mapFunction: (el: DocumentData) => any): Unsubscribe | null {
    if (!this._db)
      return null;
    return onSnapshot(collection(this._db, collectionName), (snapshot) => {
      subject.next(snapshot.docs.map<any>(doc => mapFunction(doc)));
    }, error => { });
  }

  public async signOut(signInAnon: boolean = false): Promise<void> {
    new Promise<void>(async (resolve, reject) => {
      if (this._auth)
        try {
          await this._auth.signOut();
          if (signInAnon)
            await this.connectAnonymously();
          resolve();
        } catch (error) {
          reject(error);
        }
    });

  }

  public isUserConnected(): Promise<boolean> {
    const response = new Promise<boolean>(async (resolve, reject) => {
      if (!this._auth)
        resolve(false);
      resolve(this._auth!.currentUser != null)
    });
    return response;
  }

  public isUserConnectedAnonymously(): Promise<boolean> {
    const response = new Promise<boolean>(async (resolve, reject) => {
      if (!this._auth)
        resolve(false);
      resolve(this._auth!.currentUser != null && this._auth!.currentUser.isAnonymous);
    });
    return response;

  }

  public async connectAnonymously(): Promise<void> {
    const response = new Promise<void>(async (resolve, reject) => {
      if (!this._auth)
        resolve();
      if (!(await this.isUserConnected()) && !(await this.isUserConnectedAnonymously())) {
        await signInAnonymously(this._auth!).catch(error => reject(error));
        resolve();
      }
      else if (await this.isUserConnectedAnonymously())
        resolve();
      else
        reject({ msg: "An user is already connected" });

    });
    return response;
  }

  public async createUserWithEmailAndPassword(email: string, password: string): Promise<FirebaseUserCredential | null> {
    return new Promise(async (resolve, reject) => {
      if (!this._auth)
        resolve(null);
      try {
        resolve({ user: await createUserWithEmailAndPassword(this._auth!, email, password) });
      } catch (error: any) {
        switch (error.code) {
          case 'auth/email-already-in-use':
            console.error(`Email address ${email} already in use.`);
            break;
          case 'auth/invalid-email':
            console.error(`Email address ${email} is invalid.`);
            break;
          case 'auth/operation-not-allowed':
            console.error(`Error during sign up.`);
            break;
          case 'auth/weak-password':
            console.error('Password is not strong enough. Add additional characters including special characters and numbers.');
            break;
          default:
            console.error(error.message);
            break;
        }
        reject(error);
      }
    });

  }

  public async connectUserWithEmailAndPassword(email: string, password: string): Promise<FirebaseUserCredential | null> {
    return new Promise<FirebaseUserCredential | null>(async (resolve, _) => {
      if (!this._auth)
        resolve(null);
      resolve({ user: await signInWithEmailAndPassword(this._auth!, email, password) });
    });

  }

  public deleteUser(): Promise<void> {
    throw new Error('Method not implemented');
    /* return new Promise<void>((resolve, reject) => {
      if (!this._user)
        reject();
      resolve(deleteUser(this._user!));
    }); */
  }

  public updateDocumentField(collectionName: string, document: string, fieldName: string, fieldValue: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this._db) {
        reject({
          msg: "Database is not connected"
        });
      }

      const documentRef = doc(this._db as Firestore, collectionName, document);
      const fieldUpdate = { [fieldName]: fieldValue }; // Crear un objeto con el campo a actualizar

      try {
        await updateDoc(documentRef, fieldUpdate);
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }
}