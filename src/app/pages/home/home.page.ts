import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, NavController } from '@ionic/angular';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage {

  constructor(private router: Router) {}

  start() {
    this.router.navigate(['/video']);
  }
}