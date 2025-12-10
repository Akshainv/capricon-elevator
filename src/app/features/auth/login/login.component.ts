import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';  // Added RouterModule
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var AOS: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],  // Added RouterModule
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  showPassword: boolean = false;

  constructor(private router: Router) {}

  ngOnInit() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 1000,
        once: true,
        easing: 'ease-out-cubic'
      });
    }
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  onSubmit() {
    if (this.email && this.password) {
      localStorage.setItem('isLoggedIn', 'true');
      this.router.navigate(['/dashboard']);
    }
  }
}