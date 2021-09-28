import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class FirestoreService {

  constructor(private firestore:AngularFirestore) { }


  // public insertar(coleccion, datos) {
  //   return this.firestore.collection(coleccion).add(datos);
  // }

  public consultar(coleccion) {
    return this.firestore.collection(coleccion).snapshotChanges();
  }

  public vaciarDatos(coleccion, documentId) {
    return this.firestore.collection(coleccion).doc(documentId).set({
      'QR10':0,
      'QR50':0,
      'QR100':0,
      'credito':0
    });
  }

  public insertar(coleccion, documento, datos) {
    return this.firestore.collection(coleccion).doc(documento).set(datos);
   }

}
