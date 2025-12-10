// src/app/shared/components/sales-sidebar/sales-sidebar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../core/services/theme.service';
import { Subject, takeUntil } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sales-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sales-sidebar.component.html',
  styleUrls: ['./sales-sidebar.component.css']
})
export class SalesSidebarComponent implements OnInit, OnDestroy {
  currentLogo: string = 'assets/images/logo-light.png';
  private destroy$ = new Subject<void>();
  
  // Sales user info
  userName: string = 'Sales Executive';
  userRole: string = 'Sales Team';

  menuSections: MenuSection[] = [
    {
      title: 'Dashboard',
      items: [
        { icon: 'fa-chart-line', label: 'Sales Dashboard', route: '/dashboard' }
      ]
    },
    {
      title: 'Lead Management',
      items: [
        { icon: 'fa-users', label: 'My Leads', route: '/leads', badge: 84 },
        { icon: 'fa-user-plus', label: 'Add New Lead', route: '/leads/add' },
        { icon: 'fa-file-import', label: 'Import Leads', route: '/leads/import' }
      ]
    },
    {
      title: 'Communication',
      items: [
        { icon: 'fa-clipboard-list', label: 'Activity Log', route: '/activities' },
        { icon: 'fa-tasks', label: 'My Tasks', route: '/tasks', badge: 17 },
        { icon: 'fa-calendar-alt', label: 'Calendar', route: '/calendar' }
      ]
    },
    {
      title: 'Quotations',
      items: [
        { icon: 'fa-file-invoice', label: 'My Quotations', route: '/quotations', badge: 23 },
        { icon: 'fa-edit', label: 'Create Quotation', route: '/quotations/create' }
      ]
    },
    {
      title: 'Deals & Projects',
      items: [
        { icon: 'fa-briefcase', label: 'My Deals', route: '/deals', badge: 31 },
        { icon: 'fa-project-diagram', label: 'Projects', route: '/projects' }
      ]
    },
    {
      title: 'Reports',
      items: [
        { icon: 'fa-chart-bar', label: 'My Performance', route: '/reports/performance' },
        { icon: 'fa-chart-pie', label: 'Sales Reports', route: '/reports' }
      ]
    },
    {
      title: 'Settings',
      items: [
        { icon: 'fa-user-circle', label: 'My Profile', route: '/profile' },
        { icon: 'fa-cog', label: 'Settings', route: '/settings' }
      ]
    }
  ];

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {
    console.log('✅ Sales Sidebar: Constructor called');
  }

  ngOnInit(): void {
    console.log('✅ Sales Sidebar: ngOnInit called');
    
    // Load user info from localStorage or service
    const storedUser = localStorage.getItem('sales_user');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      this.userName = user.name || 'Sales Executive';
      this.userRole = user.role || 'Sales Team';
    }
    
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme: 'dark' | 'light') => {
        console.log('🎨 Sales Sidebar - Theme changed to:', theme);
        
        if (theme === 'dark') {
          this.currentLogo = 'assets/images/logo1.png';
          console.log('   → Using logo1.png');
        } else {
          this.currentLogo = 'assets/images/capricorn.png';
          console.log('   → Using capricorn.png');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      console.log('🚪 Sales Executive logging out...');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('sales_user');
      this.router.navigate(['/login']);
    }
  }
}