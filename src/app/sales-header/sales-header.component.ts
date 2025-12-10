// src/app/shared/components/sales-header/sales-header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../core/services/theme.service';
import { Subject, takeUntil } from 'rxjs';

interface Notification {
  icon: string;
  text: string;
  time: string;
  type: 'info' | 'success' | 'warning';
  route?: string;
}

interface QuickAction {
  icon: string;
  label: string;
  route: string;
}

@Component({
  selector: 'app-sales-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-header.component.html',
  styleUrls: ['./sales-header.component.css']
})
export class SalesHeaderComponent implements OnInit, OnDestroy {
  showNotifications = false;
  showProfile = false;
  showQuickActions = false;
  currentTheme: 'dark' | 'light' = 'dark';
  private destroy$ = new Subject<void>();

  // Sales-specific data
  userName: string = 'Sales Executive';
  userEmail: string = 'sales@inspitetech.com';
  userRole: string = 'Sales Team';
  userInitials: string = 'SE';

  // Sales-specific notifications
  notifications: Notification[] = [
    { 
      icon: 'fa-user-plus', 
      text: 'New lead assigned: ABC Corporation', 
      time: '5 min ago', 
      type: 'info',
      route: '/leads'
    },
    { 
      icon: 'fa-file-invoice', 
      text: 'Quotation approved by client', 
      time: '1 hour ago', 
      type: 'success',
      route: '/quotations'
    },
    { 
      icon: 'fa-bell', 
      text: 'Follow-up call reminder for today', 
      time: '2 hours ago', 
      type: 'warning',
      route: '/tasks'
    },
    { 
      icon: 'fa-handshake', 
      text: 'Deal moved to won stage', 
      time: '3 hours ago', 
      type: 'success',
      route: '/deals'
    },
    { 
      icon: 'fa-tasks', 
      text: '5 tasks pending for today', 
      time: '4 hours ago', 
      type: 'warning',
      route: '/tasks'
    }
  ];

  // Quick action buttons for sales
  quickActions: QuickAction[] = [
    { icon: 'fa-user-plus', label: 'Add Lead', route: '/leads/add' },
    { icon: 'fa-file-invoice', label: 'New Quote', route: '/quotations/create' },
    { icon: 'fa-tasks', label: 'Add Task', route: '/tasks' },
    { icon: 'fa-phone', label: 'Log Call', route: '/activities' }
  ];

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Load user info from localStorage or service
    this.loadUserInfo();
    
    // Subscribe to theme changes
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe(theme => {
        this.currentTheme = theme;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadUserInfo(): void {
    const storedUser = localStorage.getItem('sales_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.userName = user.name || 'Sales Executive';
      this.userEmail = user.email || 'sales@inspitetech.com';
      this.userRole = user.role || 'Sales Team';
      this.userInitials = this.getInitials(this.userName);
    }
  }

  private getInitials(name: string): string {
    const names = name.split(' ');
    if (names.length >= 2) {
      return names[0][0] + names[1][0];
    }
    return names[0][0] + (names[0][1] || '');
  }

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfile = false;
    this.showQuickActions = false;
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile;
    this.showNotifications = false;
    this.showQuickActions = false;
  }

  toggleQuickActions(): void {
    this.showQuickActions = !this.showQuickActions;
    this.showNotifications = false;
    this.showProfile = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    this.closeAllDropdowns();
  }

  closeAllDropdowns(): void {
    this.showNotifications = false;
    this.showProfile = false;
    this.showQuickActions = false;
  }

  getThemeIcon(): string {
    return this.currentTheme === 'dark' ? 'fa-sun' : 'fa-moon';
  }

  getThemeLabel(): string {
    return this.currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }

  navigateTo(route: string): void {
    this.router.navigate([route]);
    this.closeAllDropdowns();
  }

  handleNotificationClick(notification: Notification): void {
    if (notification.route) {
      this.navigateTo(notification.route);
    }
  }

  handleQuickAction(action: QuickAction): void {
    this.navigateTo(action.route);
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('sales_user');
      this.router.navigate(['/login']);
    }
  }

  getUnreadCount(): number {
    return this.notifications.length;
  }
}