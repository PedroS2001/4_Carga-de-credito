import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { LoadingController } from '@ionic/angular';
import { IonicAuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  correo:string ="";
  clave:string ="";
  userForm: FormGroup;
  successMsg: string = '';
  errorMsg: string = '';
  ingresoRapido:boolean = false;
  
  mostrarIngresoRapido()
  {
    this.ingresoRapido = true;
  }


  async presentLoading() {
    const loading = await this.loadingController.create({
      message: 'Cargando',
      duration: 2000,
      spinner: 'bubbles'
    });
    await loading.present();
  }

  error_msg = {
    'email': [
      { 
        type: 'required', 
        message: 'El correo es requerido' 
      },
      { 
        type: 'pattern', 
        message: 'El correo es invalido' 
      }
    ],
    'password': [
      { 
        type: 'required', 
        message: 'La clave es requerida' 
      },
      { 
        type: 'minlength', 
        message: 'La clave debe tener al menos 6 caracteres' 
      }
    ]
  };

  constructor(
    private router: Router,
    private ionicAuthService: IonicAuthService,
    private fb: FormBuilder,
    private loadingController: LoadingController

  ) {
   }

  ngOnInit() {
    this.userForm = this.fb.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.minLength(6),
        Validators.required
      ])),
    });
  }

  signIn(value) {
    this.presentLoading();
    this.ionicAuthService.signinUser(value)
      .then((response) => {
        this.ionicAuthService.currentUser = value;
        console.log(response)
        this.errorMsg = "";
        this.limpiar();
        this.router.navigateByUrl('principal');
      }, error => {
        this.errorMsg = "Credenciales invalidas";
        this.successMsg = "";
      })
  }





  limpiar()
  {
    this.correo = '';
    this.clave = '';
  }
  isAdmin()
  {
    this.correo = "admin@admin.com";
    this.clave = '111111';
  }
  isInvitado()
  {
    this.correo = "invitado@invitado.com"
    this.clave = '222222';
  }
  isUsuario()
  {
    this.correo = "usuario@usuario.com"
    this.clave = '333333';
  }
  isAnonimo()
  {
    this.correo = "anonimo@anonimo.com";
    this.clave = '444444';
  }
  isTester()
  {
    this.correo = "tester@tester.com";
    this.clave = '555555';
  }

}
