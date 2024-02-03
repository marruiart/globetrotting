import { UserCredential } from "firebase/auth";
import { DocumentData } from "firebase/firestore";

export interface FirebaseStorageFile {
    path: string,
    file: string
};

export interface FirebaseCollectionResponse {
    name: string,
    size?: number,
    pageSize?: number,
    docs: FirebaseDocument[]
}

export interface FirebaseDocument {
    id: string,
    data: DocumentData
}

export interface FirebaseUserCredential {
    user: UserCredential
}
export type FirebaseArrayResponse<T> = [T];