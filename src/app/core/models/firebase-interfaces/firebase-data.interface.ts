import { UserCredential } from "firebase/auth";
import { DocumentData } from "firebase/firestore";

export interface FirebaseStorageFile {
    path: string,
    file: string
};

export type FirebaseCollectionResponse = {
    name: string,
    size?: number,
    pageSize?: number,
    docs: FirebaseDocument[]
}

export type FirebaseDocument = {
    id: string,
    data: DocumentData
}

export interface FirebaseUserCredential {
    user: UserCredential
}
export type FirebaseArrayResponse<T> = [T];

export type FormChanges = { updates: BatchUpdate | null };
export type BatchUpdate = {
    [controlName: string]: {
        [collection: string]: {
            fieldPath: string,
            value: string | number,
            fieldName: string,
            fieldValue?: any
        }[]
    }
}

export type FieldUpdate = {
    fieldName: string,
    fieldValue?: any
}

export type CollectionUpdates = {
    [collection: string]:
    {
        fieldPath: string,
        value: string | number,
        fieldUpdates: FieldUpdate[]
    }[]
};