import { Inject, Injectable } from '@angular/core';
import { FirebaseApp, initializeApp } from "firebase/app";
import { Auth, UserCredential, createUserWithEmailAndPassword, indexedDBLocalPersistence, initializeAuth, signInAnonymously, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { DocumentData, DocumentReference, DocumentSnapshot, FieldPath, Firestore, QueryCompositeFilterConstraint, QueryConstraint, QueryNonFilterConstraint, Transaction, TransactionOptions, Unsubscribe, WhereFilterOp, addDoc, arrayUnion, collection, deleteDoc, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, query, runTransaction, setDoc, startAfter, updateDoc, where, writeBatch } from "firebase/firestore";
import { FirebaseStorage, getDownloadURL, getStorage, ref, uploadBytes } from "firebase/storage";
import { BehaviorSubject, Observable, from } from 'rxjs';
import { CollectionUpdates, FieldUpdate, FirebaseCollectionResponse, FirebaseDocument, FirebaseStorageFile, FirebaseUserCredential } from 'src/app/core/models/firebase-interfaces/firebase-data.interface';
import { AuthFacade } from '../../+state/auth/auth.facade';
import { DestinationsFacade } from '../../+state/destinations/destinations.facade';
import { FavoritesFacade } from '../../+state/favorites/favorites.facade';
import { Sizes } from '../../+state/favorites/favorites.reducer';
import { AdminAgentOrClientUser } from '../../models/globetrotting/user.interface';
import { Collections, Roles } from '../../utilities/utilities';
import { FileUploadEvent } from 'primeng/fileupload';

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {
  private unsubscribe!: Unsubscribe | null;
  private adminConfig: any = null;
  private _app!: FirebaseApp;
  private _db!: Firestore;
  private _auth!: Auth;
  private _admin!: Auth;
  private _webStorage!: FirebaseStorage;
  private _sizes: Sizes = {};

  constructor(
    @Inject('firebase-config') config: any,
    @Inject('admin-config') adminConfig: any,
    private authFacade: AuthFacade,
    private favsFacade: FavoritesFacade,
    private destinationsFacade: DestinationsFacade
  ) {
    this.adminConfig = adminConfig;
    this._app = this.initFirebaseApp(config);
    this._auth = this.initAuthInstance(this._app);
    this.initSubscriptions();
  }

  public db() {
    return this._db;
  }

  private initFirebaseApp(config: any, name?: string) {
    const app = initializeApp(config, name);
    this._db = getFirestore(this._app);
    this._webStorage = getStorage(this._app);
    return app;
  }

  private initAuthInstance(app: FirebaseApp) {
    return initializeAuth(app, { persistence: indexedDBLocalPersistence });
  }

  private initSubscriptions() {
    this.subscribeToUser();
    this.subscribeToSizes();
  }

  private subscribeToUser() {
    let isFirstTime = true;
    this._auth.onAuthStateChanged(async user => {
      if (user?.uid && user?.email) {
        let token = await user.getIdToken();
        this.authFacade.setToken(token)
        const _user = new BehaviorSubject<AdminAgentOrClientUser | null>(null);
        this.unsubscribe = this.subscribeToDocument(Collections.USERS, `${user.uid}`, _user);
        _user.subscribe(user => {
          if (user) {
            this.authFacade.updateUser(user, isFirstTime);
            isFirstTime = false;
            switch (user.role) {
              case Roles.AUTHENTICATED:
                this.favsFacade.assignClientFavs(user.favorites);
                break;
              case Roles.ADMIN:
                this._admin = this.initAuthInstance(this.initFirebaseApp(this.adminConfig, Roles.ADMIN));
                break;
            }
          }
        });
      } else {
        if (this.unsubscribe) {
          isFirstTime = true;
          this.unsubscribe();
        }
        this.authFacade.logout();
      };
    });
  }

  private async subscribeToSizes() {
    this.destinationsFacade.destinations$.subscribe(dests => {
      this._sizes[Collections.DESTINATIONS] = dests.length;
    })
  }

  public generateId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  // CREATE

  public async fileUpload(event: FileUploadEvent, filename: string): Promise<string | null> {
    const file = event.files[0]; // Obteniendo el archivo del evento

    if (file) {
      try {
        const storageRef = ref(this._webStorage, `${filename}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);

        console.log('File uploaded successfully:', downloadURL);
        // Aquí puedes manejar la URL de descarga, como guardarla en tu base de datos

        return downloadURL
      } catch (error) {
        console.error('Error uploading file:', error);
      }
    }
    return null
  }

  public async getFileDownloadUrl(url: string): Promise<string> {
    const fileRef = ref(this._webStorage!, url);
    const fileUrl = await getDownloadURL(fileRef)
    console.log(`Download file here: ${fileUrl}`)
    return fileUrl
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

  public async createUser(email: string, password: string, admin?: Auth): Promise<FirebaseUserCredential | null> {
    return new Promise(async (resolve, reject) => {
      if (!this._auth && !admin) {
        resolve(null);
      }
      try {
        resolve({ user: await createUserWithEmailAndPassword((admin ?? this._auth), email, password) });
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

  public createAgent = (email: string, password: string) => this.createUser(email, password, this._admin);
  // READ

  /**
   * Get all documents in a collection.
   * @param collectionName 
   * @returns 
   */
  public getDocuments(collectionName: string, start: DocumentSnapshot | null = null, pageSize?: number): Promise<FirebaseCollectionResponse> {
    return new Promise(async (resolve, reject) => {
      if (!this._db) {
        reject({ msg: "Database is not connected" });
      }
      let size = this._sizes[collectionName];
      let docQuery = query(collection(this._db!, collectionName));
      if (start && pageSize) {
        docQuery = query(collection(this._db!, collectionName), startAfter(start), limit(pageSize))
      } else if (start) {
        docQuery = query(collection(this._db!, collectionName), startAfter(start))
      } else if (pageSize) {
        docQuery = query(collection(this._db!, collectionName), limit(pageSize))
      }
      const querySnapshot = await getDocs(docQuery);
      resolve({
        name: collectionName,
        size: size,
        pageSize: pageSize,
        docs: querySnapshot.docs.map<FirebaseDocument>(doc => ({ id: doc.id, data: doc.data() }))
      });
    });
  }

  /**
   * Get a document by its id.
   * @param collectionName 
   * @param id 
   * @returns 
   */
  public getDocument(collectionName: string, id: string): Promise<FirebaseDocument> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Error: Database is not connected."
        });
      const docRef = this.getDocRef(collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        resolve({ id: docSnap.id, data: docSnap.data() });
      } else {
        // doc.data() will be undefined in this case
        reject('Error: Document does not exists.');
      }
    });
  }

  public getDocRef(collectionName: string, id: string): DocumentReference {
    return doc(this._db!, collectionName, id);
  }

  /**
   * Get all the documents filtered by a certain 'where' clause.
   * @param collectionName 
   * @param fieldPath
   * @param opStr
   * @param value 
   * @returns 
   */
  public getDocumentsBy(collectionName: string, fieldPath: string | FieldPath, value: unknown, opStr: WhereFilterOp = '=='): Promise<FirebaseDocument[]> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Error: Database is not connected."
        });

      const docQuery = query(collection(this._db!, collectionName), where(fieldPath, opStr, value));
      const querySnapshot = await getDocs(docQuery);
      resolve(querySnapshot.docs.map<FirebaseDocument>(doc => {
        return { id: doc.id, data: doc.data() }
      }));
    });
  }

  // UPDATE

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
      await updateDoc(doc(collectionRef, document), data).then(_ => resolve()
      ).catch(err => reject(err));
    });
  }

  /**
   * Update a field of a document with the value passed. 
   * @param collectionName 
   * @param document 
   * @param fieldName 
   * @param fieldValue 
   * @returns 
   */
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

  public batchUpdateCollections(updates: CollectionUpdates) {
    Object.entries(updates).map(([collection, updates]) => {
      updates.forEach(async ({ fieldPath, value, fieldUpdates }) => {
        const docs = await this.getDocumentsBy(collection, fieldPath, value).catch(err => { throw new Error(err) });
        const docsId = docs.map(({ id }) => id);
        if (docs.length) {
          await this.batchUpdateDocuments(collection, fieldUpdates, ...docsId).catch(err => { throw new Error(err) });
        }
      })
    })
  }

  public batchUpdateDocuments(collectionName: string, fieldUpdates: FieldUpdate[], ...docsId: string[]) {
    const batch = writeBatch(this._db);
    docsId.forEach(documentId => {
      const docRef = doc(this._db, collectionName, documentId);
      fieldUpdates.forEach(({ fieldName, fieldValue }) => {
        batch.update(docRef, { [fieldName]: fieldValue })
      })
    });
    return batch.commit();
  }

  public async runTransaction(updateFunction: (transaction: Transaction) => Promise<void>, options?: TransactionOptions | undefined) {
    try {
      await runTransaction(this._db, updateFunction);
      console.log("Transaction successfully committed!");
    } catch (e) {
      console.log("Transaction failed: ", e);
    }
  }

  /**
   * Push an element inside an array field of the document.
   * @param collectionName 
   * @param document 
   * @param field 
   * @param value 
   * @returns 
   */
  public pushDocumentArray(collectionName: string, document: string, field: string, value: any): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (!this._db)
        reject({
          msg: "Database is not connected"
        });
      const collectionRef = collection(this._db!, collectionName);
      await updateDoc(doc(collectionRef, document), {
        [field]: arrayUnion(value)
      }).then(_ => resolve()
      ).catch(err => reject(err));
    });
  }

  // DELETE

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

  // SUBSCRIPTIONS

  // TODO Add mapping to subscriptions
  public subscribeToCollection(collectionName: string, subject: BehaviorSubject<FirebaseCollectionResponse | null>): Unsubscribe | null {
    if (!this._db) {
      return null;
    }
    return onSnapshot(collection(this._db, collectionName), (querySnapshot) => {
      const res = {
        name: collectionName,
        size: querySnapshot.size,
        pageSize: querySnapshot.size,
        docs: querySnapshot.docs.map<FirebaseDocument>(doc => ({ id: doc.id, data: doc.data() }))
      }
      subject.next(res);
    }, error => { throw new Error(error.message) });
  }


  public subscribeToCollectionQuery(collectionName: string, subject: BehaviorSubject<FirebaseCollectionResponse | null>, compositeFilter: QueryCompositeFilterConstraint, ...queryConstraints: QueryNonFilterConstraint[]): Unsubscribe | null;
  public subscribeToCollectionQuery(collectionName: string, subject: BehaviorSubject<FirebaseCollectionResponse | null>, ...queryConstraints: QueryConstraint[]): Unsubscribe | null;
  public subscribeToCollectionQuery(collectionName: string, subject: BehaviorSubject<FirebaseCollectionResponse | null>, compositeFilter: any = null, ...queryConstraints: (QueryConstraint | QueryNonFilterConstraint)[]): Unsubscribe | null {
    if (!this._db) {
      return null;
    }
    let _query;
    if (compositeFilter) {
      _query = query(collection(this._db!, collectionName), compositeFilter, ...queryConstraints);
    } else {
      _query = query(collection(this._db!, collectionName), ...queryConstraints);
    }
    return onSnapshot(_query, (querySnapshot) => {
      const res = {
        name: collectionName,
        size: querySnapshot.size,
        pageSize: querySnapshot.size,
        docs: querySnapshot.docs.map<FirebaseDocument>(doc => ({ id: doc.id, data: doc.data() }))
      }
      subject.next(res);
    }, error => { throw new Error(error.message) });
  }

  public subscribeToDocument(collectionName: string, documentId: string, subject: BehaviorSubject<any>, mapFunction: (el: DocumentData) => any = res => res): Unsubscribe | null {
    if (!this._db) {
      return null;
    }
    const docRef = doc(this._db, collectionName, documentId);
    return onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        subject.next(mapFunction(snapshot.data() as DocumentData));
      } else {
        throw new Error('Error: The document does not exist.')
      }
    }, error => { throw new Error(error.message) });
  }

  // OTHER METHODS

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

  public async connectUserWithEmailAndPassword(email: string, password: string): Promise<UserCredential | null> {
    return new Promise<UserCredential | null>(async (resolve, _) => {
      if (!this._auth)
        resolve(null);
      resolve(await signInWithEmailAndPassword(this._auth!, email, password));
    });

  }

}
