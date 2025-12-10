// src/app/features/employee/employee-approvals/employee-approvals.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface EmployeeRegistration {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  photo: string | null;
  status: 'pending' | 'approved' | 'rejected';
  submittedDate: Date;
  reviewedDate?: Date;
  reviewedBy?: string;
}

@Component({
  selector: 'app-employee-approvals',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './employee-approvals.component.html',
  styleUrls: ['./employee-approvals.component.css']
})
export class EmployeeApprovalsComponent implements OnInit {
  // Filter options
  filterStatus: string = 'all';
  searchQuery: string = '';
  
  // Statistics
  totalRegistrations: number = 0;
  pendingCount: number = 0;
  approvedCount: number = 0;
  rejectedCount: number = 0;

  // Mock data - In real app, this would come from API
  allEmployees: EmployeeRegistration[] = [
    {
      id: 'EMP-2024-001',
      name: 'Rahul Kumar',
      email: 'rahul.kumar@example.com',
      phoneNumber: '+91 9876543210',
      photo: 'assets/images/avatars/user1.jpg',
      status: 'pending',
      submittedDate: new Date('2024-12-05T10:30:00')
    },
    {
      id: 'EMP-2024-002',
      name: 'Priya Sharma',
      email: 'priya.sharma@example.com',
      phoneNumber: '+91 9876543211',
      photo: 'assets/images/avatars/user2.jpg',
      status: 'pending',
      submittedDate: new Date('2024-12-06T14:20:00')
    },
    {
      id: 'EMP-2024-003',
      name: 'Amit Patel',
      email: 'amit.patel@example.com',
      phoneNumber: '+91 9876543212',
      photo: null,
      status: 'approved',
      submittedDate: new Date('2024-12-01T09:15:00'),
      reviewedDate: new Date('2024-12-02T11:00:00'),
      reviewedBy: 'Admin - Asin Iqbal'
    },
    {
      id: 'EMP-2024-004',
      name: 'Sneha Reddy',
      email: 'sneha.reddy@example.com',
      phoneNumber: '+91 9876543213',
      photo: 'assets/images/avatars/user3.jpg',
      status: 'approved',
      submittedDate: new Date('2024-11-28T16:45:00'),
      reviewedDate: new Date('2024-11-29T10:30:00'),
      reviewedBy: 'Admin - Asin Iqbal'
    },
    {
      id: 'EMP-2024-005',
      name: 'Vijay Singh',
      email: 'vijay.singh@example.com',
      phoneNumber: '+91 9876543214',
      photo: 'assets/images/avatars/user4.jpg',
      status: 'rejected',
      submittedDate: new Date('2024-11-25T13:20:00'),
      reviewedDate: new Date('2024-11-26T09:00:00'),
      reviewedBy: 'Admin - Asin Iqbal'
    },
    {
      id: 'EMP-2024-006',
      name: 'Anjali Mehta',
      email: 'anjali.mehta@example.com',
      phoneNumber: '+91 9876543215',
      photo: null,
      status: 'pending',
      submittedDate: new Date('2024-12-07T08:10:00')
    }
  ];

  filteredEmployees: EmployeeRegistration[] = [];
  selectedEmployee: EmployeeRegistration | null = null;
  showDetailModal: boolean = false;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadEmployees();
    this.calculateStatistics();
  }

  loadEmployees(): void {
    // In real app, this would be an API call
    this.applyFilters();
  }

  calculateStatistics(): void {
    this.totalRegistrations = this.allEmployees.length;
    this.pendingCount = this.allEmployees.filter(e => e.status === 'pending').length;
    this.approvedCount = this.allEmployees.filter(e => e.status === 'approved').length;
    this.rejectedCount = this.allEmployees.filter(e => e.status === 'rejected').length;
  }

  applyFilters(): void {
    let filtered = [...this.allEmployees];

    // Apply status filter
    if (this.filterStatus !== 'all') {
      filtered = filtered.filter(emp => emp.status === this.filterStatus);
    }

    // Apply search filter
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(emp => 
        emp.name.toLowerCase().includes(query) ||
        emp.email.toLowerCase().includes(query) ||
        emp.phoneNumber.includes(query) ||
        emp.id.toLowerCase().includes(query)
      );
    }

    // Sort by submitted date (newest first)
    filtered.sort((a, b) => b.submittedDate.getTime() - a.submittedDate.getTime());

    this.filteredEmployees = filtered;
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  viewDetails(employee: EmployeeRegistration): void {
    this.selectedEmployee = employee;
    this.showDetailModal = true;
  }

  closeDetailModal(): void {
    this.showDetailModal = false;
    this.selectedEmployee = null;
  }

  approveEmployee(employee: EmployeeRegistration): void {
    if (confirm(`Are you sure you want to approve ${employee.name}?`)) {
      employee.status = 'approved';
      employee.reviewedDate = new Date();
      employee.reviewedBy = 'Admin - Asin Iqbal';
      
      this.calculateStatistics();
      this.applyFilters();
      
      // Show success message
      this.showNotification('Employee approved successfully!', 'success');
      
      // In real app, make API call here
      console.log('Approved:', employee);
    }
  }

  rejectEmployee(employee: EmployeeRegistration): void {
    if (confirm(`Are you sure you want to reject ${employee.name}? This action cannot be undone.`)) {
      employee.status = 'rejected';
      employee.reviewedDate = new Date();
      employee.reviewedBy = 'Admin - Asin Iqbal';
      
      this.calculateStatistics();
      this.applyFilters();
      
      // Show warning message
      this.showNotification('Employee registration rejected.', 'warning');
      
      // In real app, make API call here
      console.log('Rejected:', employee);
    }
  }

  deleteEmployee(employee: EmployeeRegistration): void {
    if (confirm(`Are you sure you want to permanently delete ${employee.name}? This action cannot be undone.`)) {
      // Remove from array
      const index = this.allEmployees.findIndex(e => e.id === employee.id);
      if (index > -1) {
        this.allEmployees.splice(index, 1);
      }
      
      this.calculateStatistics();
      this.applyFilters();
      this.closeDetailModal();
      
      // Show error message
      this.showNotification('Employee record deleted permanently.', 'error');
      
      // In real app, make API call here
      console.log('Deleted:', employee);
    }
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'pending': 'status-pending',
      'approved': 'status-approved',
      'rejected': 'status-rejected'
    };
    return statusClasses[status] || '';
  }

  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'pending': 'fa-clock',
      'approved': 'fa-check-circle',
      'rejected': 'fa-times-circle'
    };
    return statusIcons[status] || 'fa-question-circle';
  }

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      const hours = Math.floor(diff / (1000 * 60 * 60));
      if (hours === 0) {
        const minutes = Math.floor(diff / (1000 * 60));
        return `${minutes} minutes ago`;
      }
      return `${hours} hours ago`;
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return `${days} days ago`;
    } else {
      return new Date(date).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    }
  }

  showNotification(message: string, type: 'success' | 'warning' | 'error'): void {
    // Simple notification - in real app, use a proper notification service
    alert(message);
  }

  exportToCSV(): void {
    // Implement CSV export functionality
    console.log('Exporting to CSV...');
    alert('Export functionality will be implemented');
  }
}