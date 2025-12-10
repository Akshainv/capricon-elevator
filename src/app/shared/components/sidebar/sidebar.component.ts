// src/app/shared/components/sidebar/sidebar.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../../core/services/theme.service';
import { Subject, takeUntil } from 'rxjs';

interface MenuItem {
  icon: string;
  label: string;
  route: string;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit, OnDestroy {
  currentLogo: string = 'assets/images/logo-light.png';
  private destroy$ = new Subject<void>();

  menuSections: MenuSection[] = [
    {
      title: 'Main',
      items: [
        { icon: 'fa-chart-line', label: 'Dashboard', route: '/admin-dashboard' },
        { icon: 'fa-user-check', label: 'Employee Approvals', route: '/admin/employee-approvals' }
      ]
    },
    {
      title: 'Sales',
      items: [
        { icon: 'fa-users', label: 'Leads', route: '/admin/leads' },
        { icon: 'fa-file-invoice', label: 'Quotations', route: '/admin/quotations' },
        { icon: 'fa-handshake', label: 'Deals', route: '/admin/deals' }
      ]
    },
    {
      title: 'Communication',
      items: [
        { icon: 'fa-tasks', label: 'Tasks', route: '/admin/tasks' }
      ]
    },
    {
      title: 'Management',
      items: [
        { icon: 'fa-project-diagram', label: 'Projects', route: '/admin/projects' },
        { icon: 'fa-chart-bar', label: 'Reports', route: '/admin/reports' }
      ]
    },
    {
      title: 'System',
      items: [
        { icon: 'fa-cog', label: 'Settings', route: '/admin/settings' }
      ]
    }
  ];

  constructor(
    public themeService: ThemeService,
    private router: Router
  ) {
    console.log('✅ Sidebar: Constructor called');
  }

  ngOnInit(): void {
    console.log('✅ Sidebar: ngOnInit called');
    console.log('📋 Menu sections loaded:', this.menuSections);
    
    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme: 'dark' | 'light') => {
        console.log('🎨 Theme changed to:', theme);
        
        if (theme === 'dark') {
          this.currentLogo = 'assets/images/logo1.png';
          console.log('   → Using logo1.png (light version)');
        } else {
          this.currentLogo = 'assets/images/capricorn.png';
          console.log('   → Using capricorn.png (dark version)');
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  logout(): void {
    if (confirm('Are you sure you want to logout?')) {
      console.log('🚪 Logging out...');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('currentUser');
      this.router.navigate(['/login']);
    }
  }

  navigateToRoute(route: string): void {
    console.log('🔗 Navigating to:', route);
    this.router.navigate([route]);
  }
}