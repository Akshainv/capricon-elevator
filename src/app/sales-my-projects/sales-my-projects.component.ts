// src/app/sales-my-projects/sales-my-projects.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Project {
  id: string;
  name: string;
  projectCode: string;
  customer: string;
  value: number;
  teamLeader: string;
  status: 'planning' | 'in-progress' | 'on-hold' | 'completed';
  progress: number;
  startDate: Date;
  expectedCompletion: Date;
  salesExecutive: string; // Who won the deal
  currentMilestone: string;
}

interface Milestone {
  title: string;
  status: 'completed' | 'in-progress' | 'pending';
}

@Component({
  selector: 'app-sales-my-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-my-projects.component.html',
  styleUrls: ['./sales-my-projects.component.css']
})
export class SalesMyProjectsComponent implements OnInit {
  searchTerm: string = '';
  selectedFilter: string = 'all';
  currentUser: string = 'John Doe'; // Will come from auth service
  
  // Only projects from deals won by this sales executive
  projects: Project[] = [
    {
      id: 'PRJ-2024-001',
      name: 'Sunrise Mall Installation',
      projectCode: 'PRJ-2024-001',
      customer: 'Sunrise Mall Pvt Ltd',
      value: 4500000,
      teamLeader: 'Suresh Menon',
      status: 'in-progress',
      progress: 65,
      startDate: new Date('2024-11-01'),
      expectedCompletion: new Date('2024-12-15'),
      salesExecutive: 'John Doe',
      currentMilestone: 'Installation & Setup'
    },
    {
      id: 'PRJ-2024-003',
      name: 'Green Apartments Installation',
      projectCode: 'PRJ-2024-003',
      customer: 'Green Apartments',
      value: 1200000,
      teamLeader: 'Deepak Singh',
      status: 'completed',
      progress: 100,
      startDate: new Date('2024-08-01'),
      expectedCompletion: new Date('2024-10-15'),
      salesExecutive: 'John Doe',
      currentMilestone: 'Final Handover'
    },
    {
      id: 'PRJ-2024-004',
      name: 'Tech Solutions Home Lift',
      projectCode: 'PRJ-2024-004',
      customer: 'Tech Solutions Ltd',
      value: 850000,
      teamLeader: 'Ravi Krishnan',
      status: 'planning',
      progress: 15,
      startDate: new Date('2024-11-20'),
      expectedCompletion: new Date('2025-01-10'),
      salesExecutive: 'John Doe',
      currentMilestone: 'Site Survey & Measurement'
    }
  ];

  milestones: Milestone[] = [
    { title: 'Site Survey & Measurement', status: 'completed' },
    { title: 'Material Procurement', status: 'completed' },
    { title: 'Installation & Setup', status: 'in-progress' },
    { title: 'Testing & Commissioning', status: 'pending' },
    { title: 'Final Handover', status: 'pending' }
  ];

  constructor(public router: Router) {}

  ngOnInit(): void {
    // Filter projects to show only those from current user's won deals
    this.loadMyProjects();
  }

  loadMyProjects(): void {
    // TODO: API call to get projects where salesExecutive = currentUser
    // this.projectService.getMyProjects(this.currentUser).subscribe(...)
  }

  getFilteredProjects(): Project[] {
    let filtered = this.projects;

    if (this.selectedFilter !== 'all') {
      filtered = filtered.filter(p => p.status === this.selectedFilter);
    }

    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(term) ||
        p.customer.toLowerCase().includes(term) ||
        p.projectCode.toLowerCase().includes(term)
      );
    }

    return filtered;
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'planning': '#60a5fa',
      'in-progress': '#f59e0b',
      'on-hold': '#ec4899',
      'completed': '#22c55e'
    };
    return colors[status] || '#999';
  }

  getStatusIcon(status: string): string {
    const icons: { [key: string]: string } = {
      'planning': 'fa-clipboard-list',
      'in-progress': 'fa-spinner',
      'on-hold': 'fa-pause-circle',
      'completed': 'fa-check-circle'
    };
    return icons[status] || 'fa-circle';
  }

  getProgressColor(progress: number): string {
    if (progress >= 80) return '#22c55e';
    if (progress >= 50) return '#f59e0b';
    return '#ef4444';
  }

  getTotalValue(): number {
    return this.projects.reduce((sum, project) => sum + project.value, 0);
  }

  getActiveProjects(): number {
    return this.projects.filter(p => p.status === 'in-progress').length;
  }

  getCompletedProjects(): number {
    return this.projects.filter(p => p.status === 'completed').length;
  }

  viewProject(project: Project): void {
    // Sales exec can only view, not edit
    this.router.navigate(['/projects', project.id]);
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }

  getDaysRemaining(date: Date): number {
    const today = new Date();
    const completion = new Date(date);
    const diff = completion.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  filterByStatus(status: string): void {
    this.selectedFilter = status;
  }
}