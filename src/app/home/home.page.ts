import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SplashScreen } from '@capacitor/splash-screen';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private router: Router) {
    setTimeout(() => {
      this.router.navigateByUrl('login');
    }, 2000);
  }

  ionViewDidEnter(){
    SplashScreen.hide();
    setTimeout(()=>{
      this.router.navigate(['login']);
    },2000);
  }

}
