import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface PerformanceStats {
  label: string;
  value: string;
  icon: string;
  color: string;
}

interface RecentActivity {
  type: string;
  description: string;
  time: string;
  icon: string;
  color: string;
}

@Component({
  selector: 'app-sales-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-profile.component.html',
  styleUrls: ['./sales-profile.component.css']
})
export class SalesProfileComponent implements OnInit {
  // User Data
  user = {
    fullName: 'John Doe',
    email: 'john@inspitetech.com',
    phone: '+91 8714158735',
    role: 'Sales Executive',
    department: 'Sales',
    location: 'Kochi, Kerala',
    employeeId: 'EMP-2024-001',
    joinDate: 'January 15, 2024',
    reportingTo: 'Sarah Manager',
    bio: 'Dedicated sales professional focused on building strong customer relationships and achieving sales targets.',
    profileImage: 'assets/images/logo1.png'
  };

  // Performance Stats (Sales Executive specific)
  performanceStats: PerformanceStats[] = [
    { label: 'Active Leads', value: '24', icon: 'fa-users', color: '#3b82f6' },
    { label: 'Deals Won', value: '18', icon: 'fa-handshake', color: '#22c55e' },
    { label: 'Quotes Sent', value: '32', icon: 'fa-file-invoice', color: '#f59e0b' },
    { label: 'Target Achievement', value: '92%', icon: 'fa-bullseye', color: '#a855f7' }
  ];

  // Recent Activities
  recentActivities: RecentActivity[] = [
    { type: 'lead', description: 'Added new lead: Metro Hospital', time: '2 hours ago', icon: 'fa-user-plus', color: '#3b82f6' },
    { type: 'quote', description: 'Sent quotation to Sunrise Mall', time: '5 hours ago', icon: 'fa-file-invoice', color: '#f59e0b' },
    { type: 'deal', description: 'Closed deal with Tech Solutions Ltd', time: '1 day ago', icon: 'fa-handshake', color: '#22c55e' },
    { type: 'call', description: 'Follow-up call with Green Apartments', time: '2 days ago', icon: 'fa-phone', color: '#a855f7' },
    { type: 'meeting', description: 'Client meeting at Royal Plaza', time: '3 days ago', icon: 'fa-calendar', color: '#ef4444' }
  ];

  // Password Change
  passwordData = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  // Notification Settings
  notifications = {
    emailNotifications: true,
    pushNotifications: true,
    smsNotifications: false,
    leadAssignments: true,
    dealUpdates: true,
    quotationApprovals: true,
    taskReminders: true,
    followUpAlerts: true
  };

  // Active Tab
  activeTab = 'profile';

  constructor() {}

  ngOnInit(): void {
    this.loadProfileData();
  }

  loadProfileData(): void {
    console.log('Loading sales profile data for:', this.user.fullName);
  }

  // Tab Selection
  selectTab(tab: string): void {
    this.activeTab = tab;
  }

  // Profile Image Upload
  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.user.profileImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  // Update Profile
  updateProfile(): void {
    console.log('Profile Updated:', this.user);
    alert('Profile updated successfully!');
  }

  // Change Password
  changePassword(): void {
    if (!this.passwordData.currentPassword || !this.passwordData.newPassword) {
      alert('Please fill in all password fields!');
      return;
    }

    if (this.passwordData.newPassword !== this.passwordData.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }

    if (this.passwordData.newPassword.length < 8) {
      alert('Password must be at least 8 characters long!');
      return;
    }

    console.log('Password Changed');
    alert('Password changed successfully!');
    this.passwordData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    };
  }

  // Update Notifications
  updateNotifications(): void {
    console.log('Notifications Updated:', this.notifications);
    alert('Notification settings updated successfully!');
  }

  // Export User Data
  exportData(): void {
    const dataStr = JSON.stringify(this.user, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `${this.user.fullName.replace(/\s+/g, '_')}_profile.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    alert('Profile data exported successfully!');
  }
}