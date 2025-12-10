import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.css']
})
export class AccountSettingsComponent {
  // General Settings
  settings = {
    companyName: 'Inspite Tech',
    companyEmail: 'info@inspitetech.com',
    companyPhone: '+91 8714158735',
    companyAddress: 'Infopark, Kochi, Kerala',
    website: 'www.inspitetech.com',
    currency: 'INR',
    timezone: 'Asia/Kolkata',
    dateFormat: 'DD/MM/YYYY',
    language: 'English'
  };

  // Security Settings
  security = {
    twoFactorAuth: false,
    sessionTimeout: '30',
    passwordExpiry: '90',
    loginAttempts: '5'
  };

  // Active Section
  activeSection = 'general';

  selectSection(section: string) {
    this.activeSection = section;
  }

  saveGeneralSettings() {
    console.log('General Settings Saved:', this.settings);
    alert('General settings saved successfully!');
  }

  saveSecurity() {
    console.log('Security Saved:', this.security);
    alert('Security settings saved successfully!');
  }
}