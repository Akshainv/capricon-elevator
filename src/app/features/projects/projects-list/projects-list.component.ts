// src/app/features/projects/projects-list/projects-list.component.ts
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
}

@Component({
  selector: 'app-projects-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects-list.component.html',
  styleUrls: ['./projects-list.component.css']
})
export class ProjectsListComponent implements OnInit {
  searchTerm: string = '';
  selectedFilter: string = 'all';
  
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
      expectedCompletion: new Date('2024-12-15')
    },
    {
      id: 'PRJ-2024-002',
      name: 'Metro Hospital Installation',
      projectCode: 'PRJ-2024-002',
      customer: 'Metro Hospital',
      value: 3500000,
      teamLeader: 'Arun Kumar',
      status: 'in-progress',
      progress: 45,
      startDate: new Date('2024-10-15'),
      expectedCompletion: new Date('2024-12-01')
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
      expectedCompletion: new Date('2024-10-15')
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
      expectedCompletion: new Date('2025-01-10')
    }
  ];

  constructor(public router: Router) {}

  ngOnInit(): void {}

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

  getPlanningProjects(): number {
    return this.projects.filter(p => p.status === 'planning').length;
  }

  viewProject(project: Project): void {
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

  onSearch(event: Event): void {
    this.searchTerm = (event.target as HTMLInputElement).value;
  }

  filterByStatus(status: string): void {
    this.selectedFilter = status;
  }
}