import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastrService } from 'ngx-toastr';
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
  collapsed: boolean = false;
  mobileMenuOpen: boolean = false;
  private resizeHandler = () => this.handleResize();
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
        { icon: 'fa-user-plus', label: 'Assign Leads', route: '/admin/leads/assign' },
        { icon: 'fa-file-invoice', label: 'Quotation', route: '/admin/admin-quotations' },
        { icon: 'fa-handshake', label: 'Deals', route: '/admin/deals' }
      ]
    },
    {
      title: 'Management',
      items: [
        { icon: 'fa-project-diagram', label: 'Projects', route: '/admin/projects' }
      ]
    },
    {
      title: 'Reports',
      items: [
        { icon: 'fa-chart-bar', label: 'Report Dashboard', route: '/admin/reports' }
      ]
    }
  ];

  constructor(
    public themeService: ThemeService,
    private router: Router,
    private authService: AuthService,
    private toastr: ToastrService
  ) {
    console.log('Sidebar: Constructor called');
  }

  ngOnInit(): void {
    console.log('Sidebar: ngOnInit called');
    console.log('Menu sections loaded:', this.menuSections);

    this.themeService.theme$
      .pipe(takeUntil(this.destroy$))
      .subscribe((theme: 'dark' | 'light') => {
        console.log('Theme changed to:', theme);

        if (theme === 'dark') {
          this.currentLogo = 'assets/images/logo1.png';
          console.log('   → Using logo1.png (light version)');
        } else {
          this.currentLogo = 'assets/images/capricorn.png';
          console.log('   → Using capricorn.png (dark version)');
        }
      });
    this.handleResize();
    window.addEventListener('resize', this.resizeHandler);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    window.removeEventListener('resize', this.resizeHandler);
  }

  logout(): void {
    this.authService.logout();
    this.toastr.success('Logged out successfully', 'Logged out');
  }

  navigateToRoute(route: string): void {
    console.log('Navigating to:', route);
    this.router.navigate([route]);
  }

  toggleCollapse(): void {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      this.mobileMenuOpen = !this.mobileMenuOpen;
      // Prevent body scroll when menu is open
      if (this.mobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    } else {
      this.collapsed = !this.collapsed;
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    document.body.style.overflow = '';
  }

  onMenuItemClick(): void {
    // Close mobile menu when clicking a menu item
    if (window.innerWidth <= 768) {
      this.closeMobileMenu();
    }
  }

  private handleResize(): void {
    const isMobile = window.innerWidth <= 768;

    if (!isMobile) {
      // Reset mobile menu state on desktop
      this.mobileMenuOpen = false;
      document.body.style.overflow = '';
      // Auto-collapse based on screen size for tablets
      this.collapsed = window.innerWidth <= 1024 && window.innerWidth > 768;
    }
  }
}