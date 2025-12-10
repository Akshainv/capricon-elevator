import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

declare var AOS: any;

@Component({
  selector: 'app-register-here',  // Changed selector
  standalone: true,
  imports: [FormsModule, CommonModule, RouterModule],
  templateUrl: './register-here.component.html',
  styleUrls: ['./register-here.component.css']
})
export class RegisterHereComponent implements OnInit {  // Changed class name
  @ViewChild('fileInput') fileInput!: ElementRef;

  // Form fields
  name: string = '';
  email: string = '';
  phoneNumber: string = '';
  password: string = '';
  confirmPassword: string = '';
  agreedToTerms: boolean = false;
  
  // Password visibility toggles
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;
  
  // Photo upload
  photoPreview: string | null = null;
  selectedFile: File | null = null;

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

  toggleConfirmPassword() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should not exceed 5MB');
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removePhoto() {
    this.photoPreview = null;
    this.selectedFile = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSubmit() {
    // Validate all fields
    if (!this.name || !this.email || !this.phoneNumber || !this.password || !this.confirmPassword) {
      alert('Please fill in all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.email)) {
      alert('Please enter a valid email address');
      return;
    }

    // Validate phone number (basic validation)
    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,9}$/;
    if (!phoneRegex.test(this.phoneNumber)) {
      alert('Please enter a valid phone number');
      return;
    }

    // Validate password length
    if (this.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    // Validate password match
    if (this.password !== this.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Validate terms agreement
    if (!this.agreedToTerms) {
      alert('Please agree to the Terms & Conditions');
      return;
    }

    // If all validations pass
    console.log('Registration form submitted:', {
      name: this.name,
      email: this.email,
      phoneNumber: this.phoneNumber,
      hasPhoto: !!this.selectedFile
    });

    // Here you would typically make an API call to register the user
    // For now, we'll just show a success message and redirect to login
    alert('Registration successful! Please login with your credentials.');
    this.router.navigate(['/login']);
  }
}