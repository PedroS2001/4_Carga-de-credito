import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { IonicAuthService } from '../auth.service';
import jsQR from "jsqr";
import { AlertController, LoadingController, Platform, ToastController } from '@ionic/angular';
import { FirestoreService } from '../firestore.service';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.page.html',
  styleUrls: ['./principal.page.scss'],
})
export class PrincipalPage implements OnInit {
  
  scanActive :boolean;
  scanResult = null;
  @ViewChild('video', {static: false}) video: ElementRef;
  @ViewChild('canvas', {static: false}) canvas: ElementRef;

  videoElement:any;
  canvasElement:any;
  canvasContext:any;

  loading: HTMLIonLoadingElement;

  ngAfterViewInit()
  {
    this.videoElement = this.video.nativeElement;
    this.canvasElement = this.canvas.nativeElement;
    this.canvasContext= this.canvasElement.getContext('2d');

  }

  usuario:string;
  datos:any;
  acumulado:number;
  

  constructor(
    private router: Router,
    private ionicAuthService: IonicAuthService,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private platform : Platform,
    private fireService: FirestoreService,
    private loadingController:LoadingController,
    private alertCrtl: AlertController
  ) {
    this.scanActive = false;
    this.acumulado = 0;
   }



  arrayDatos:any;
  leerDatos()
  {
    this.fireService.consultar('credito').subscribe((msgsSnapshot) => {
      this.arrayDatos = [];
      msgsSnapshot.forEach((registro: any) => {
        this.arrayDatos.push({
          id: registro.payload.doc.id,
          data: registro.payload.doc.data()
        }
        );
      })
    });
    console.log(this.arrayDatos);

  }

  recogerDatos()
  {
    this.usuario = this.ionicAuthService.currentUser.email;
    this.leerDatos();

    this.arrayDatos.forEach(item => {
      if(item.id == this.usuario)
      {
        this.datos = item.data;
      }
    });
    
    this.acumulado = this.datos.credito;
  }

  consolelog()
  {
    //email del usuario logueado
    console.log(this.usuario);
    //datos del usuario logueado (QR10, QR50, QR100, credito)
    console.log(this.datos);
    //datos de todos los usuarios
    console.log(this.arrayDatos);
  }
  





  ngOnInit() {
    setTimeout(() => {
      console.log('ONINIT');
      this.recogerDatos();
      this.consolelog();
    }, 1000);
    setTimeout(() => {
      console.log('ONINIT');
      this.recogerDatos();
      this.consolelog();
    }, 2500);
  }

  signOut() {
    this.ionicAuthService.signoutUser()
      .then(res => {
        this.router.navigateByUrl('login');
      })
      .catch(error => {
        console.log(error);
      })
  }


  async startScan()
  {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {facingMode: 'environment'}
    });
    this.videoElement.srcObject = stream;
    this.videoElement.setAttribute('playsinline', true);
    this.videoElement.play();

    this.loading = await this.loadingCtrl.create({});
    await this.loading.present();
    requestAnimationFrame(this.scan.bind(this));
  }

  async scan()
  {
    console.log('SCAN');
    if(this.videoElement.readyState === this.videoElement.HAVE_ENOUGH_DATA)
    {
      console.log("scanning");
      if(this.loading)
      {
        await this.loading.dismiss();
        this.loading = null;
        this.scanActive = true;
      }
      this.scanActive = true;

      this.canvasElement.height = this.videoElement.videoHeight;
      this.canvasElement.width = this.videoElement.videoWidth;

      this.canvasContext.drawImage(
        this.videoElement,
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      const imageData = this.canvasContext.getImageData(
        0,
        0,
        this.canvasElement.width,
        this.canvasElement.height
      );

      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });
      console.log('code: ', code);

      if(code)
      {
        this.scanActive = false;
        this.scanResult = code.data;
        let carga = this.cargaCredito(this.scanResult);

        this.showQrToast(carga);
      }
      else{
        if(this.scanActive)
        {
          requestAnimationFrame(this.scan.bind(this));
        }
      }

    }
    else{
      requestAnimationFrame(this.scan.bind(this));
    }

  }


  stopScan()
  {
    this.scanActive = false;
    this.router.navigateByUrl('/principal');
  }

  reset()
  {
    this.scanResult = null;
  }

  async showQrToast(mensaje:string)
  {
    const toast = await this.toastCtrl.create({
      message: mensaje,
      position: 'bottom',
      duration: 1000,
      buttons: [
        {
          text: 'Close',
          handler: () => {
            window.close();
          }
        }
      ]
    });
    toast.present();

  }

  cargaCredito(data:any) :string
  {
    if(data == '2786f4877b9091dcad7f35751bfcf5d5ea712b2f')
    {//100
      if(this.datos.QR100 == 0)
      {
        this.acumulado += 100;
        let datuskis = this.datos;
        datuskis.QR100++;
        datuskis.credito = this.acumulado;
        this.AgregarCreditoBD(datuskis);
        return 'Se escaneo con exito. +100 creditos';
      }
      else if(this.usuario == 'admin@admin.com' && this.datos.QR100 == 1){ 
        this.acumulado += 100;
        let datuskis = this.datos;
        datuskis.QR100++;
        datuskis.credito = this.acumulado;
        this.AgregarCreditoBD(datuskis);
        return 'Eres admin, has cargado el codigo por segunda y ultima vez. +100 creditos';
      }
      else
      {
        return 'Error. Ya has cargado este codigo!';
      }

    }
    else if(data == 'ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172' || data == "ae338e4e0cbb4e4bcffaf9ce5b409feb8edd5172 ")
    {//50
      if(this.datos.QR50 == 0)
      {
        this.acumulado += 50;
        let datuskis = this.datos;
        datuskis.QR50++;
        datuskis.credito = this.acumulado;
        this.AgregarCreditoBD(datuskis);
        return 'Se escaneo con exito. +50 creditos';
      }
      else if(this.usuario == 'admin@admin.com' && this.datos.QR50 == 1){ 
        this.acumulado += 50;
        let datuskis = this.datos;
        datuskis.QR50++;
        datuskis.credito = this.acumulado;
        this.AgregarCreditoBD(datuskis);
        return 'Eres admin, has cargado el codigo por segunda y ultima vez. +50 creditos';
      }
      else{ 
        return 'Error. Ya has cargado este codigo!';
      
      }
    }
    else if(data == '8c95def646b6127282ed50454b73240300dccabc')
    {
      if(this.datos.QR10 == 0)
      {
        this.acumulado += 10;
        let datuskis = this.datos;
        datuskis.QR10++;
        datuskis.credito = this.acumulado;
        this.AgregarCreditoBD(datuskis);
        return 'Se escaneo con exito. +10 creditos';
      }
      else if(this.usuario == 'admin@admin.com' && this.datos.QR10 == 1){ 
        this.acumulado += 10;
        let datuskis = this.datos;
        datuskis.QR10++;
        datuskis.credito = this.acumulado;
        this.AgregarCreditoBD(datuskis);
        return 'Eres admin, has cargado el codigo por segunda y ultima vez. +10 creditos';
      }
      else{ 
        return 'Error. Ya has cargado este codigo!';
      }
    }
    else
    {
      return 'El codigo QR no es un codigo valido';
    }

  }


  AgregarCreditoBD(datos:any) {
    this.fireService.insertar("credito", this.usuario, datos ).then(() => {
      console.log('Se agrego el credito a la BD!');
    }, (error) => {
      console.error(error);
    });
  }


  async btnBorrarCredito()
  {
    let alert = await this.alertCrtl.create({
      message: "¿Está seguro que quiere borrar todo el crédito?",
      buttons: [
        {
          text:"Aceptar",
          handler: ()=> {
            this.borrarTodoCredito();
          }
        },
        {
          text:"Cancelar",
          handler: ()=>{
            console.log("Cancelado");
          }
        }
      ]
    }
    );
    alert.present();
  }

  borrarTodoCredito()
  {
    this.presentLoading();
    this.fireService.vaciarDatos('credito', this.usuario);
    setTimeout(() => {
      this.recogerDatos();
    }, 2500);
  }

  async presentLoading() {
    const loading = await this.loadingController.create({
      spinner: null,
      message: '<img src="https://i.gifer.com/XSNt.gif" style="height:40px" >',
      duration: 2500,
      translucent: true,
      showBackdrop: true 
      
    });
    await loading.present();
  }









}
