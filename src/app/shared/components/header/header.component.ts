// src/app/shared/components/header/header.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  showNotifications = false;
  showProfile = false;
  currentTheme: 'dark' | 'light' = 'dark';
  private destroy$ = new Subject<void>();

  notifications = [
    { icon: 'fa-user-plus', text: 'New lead assigned to you', time: '5 min ago', type: 'info' },
    { icon: 'fa-file-invoice', text: 'Quotation approved', time: '1 hour ago', type: 'success' },
    { icon: 'fa-bell', text: 'Follow-up reminder', time: '2 hours ago', type: 'warning' }
  ];

  constructor(public themeService: ThemeService, private router: Router) {}

  ngOnInit(): void {
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

  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
    this.showProfile = false;
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile;
    this.showNotifications = false;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
    // Close all dropdowns when toggling theme
    this.showNotifications = false;
    this.showProfile = false;
  }

  getThemeIcon(): string {
    return this.currentTheme === 'dark' ? 'fa-sun' : 'fa-moon';
  }

  getThemeLabel(): string {
    return this.currentTheme === 'dark' ? 'Light Mode' : 'Dark Mode';
  }

  navigateTo(path: string): void {
    // If currently on an admin route, prefer admin-prefixed targets for internal navigation
    const isAdmin = this.router.url.startsWith('/admin') || this.router.url.startsWith('/admin-dashboard');

    if (isAdmin && path.startsWith('/')) {
      // Avoid double prefixing
      const target = path.startsWith('/admin') ? path : `/admin${path}`;
      this.router.navigateByUrl(target);
      this.showProfile = false;
      this.showNotifications = false;
      return;
    }

    // Default navigation for non-admin routes
    this.router.navigateByUrl(path);
    this.showProfile = false;
    this.showNotifications = false;
  }
}