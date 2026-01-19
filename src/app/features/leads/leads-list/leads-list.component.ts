// src/app/features/leads/leads-list/leads-list.component.ts (Updated with modal functionality)
import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeadsService, Lead } from '../../../lead.service';
import { EmployeeService, Employee } from '../../../../employee/employee.service';
import { Subscription } from 'rxjs';

interface DisplayLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: string;
  assignedToName: string;
}

@Component({
  selector: 'app-leads-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './leads-list.component.html',
  styleUrls: ['./leads-list.component.css']
})
export class LeadsListComponent implements OnInit, OnDestroy {
  searchTerm: string = '';
  sourceFilter: string = '';
  nameFilter: string = '';

  leads: DisplayLead[] = [];
  filteredLeads: DisplayLead[] = [];
  paginatedLeads: DisplayLead[] = [];

  // Pagination
  currentPage: number = 1;
  pageSize: number = 7;
  totalPages: number = 0;

  isLoading: boolean = true;
  errorMessage: string = '';

  // Modal management
  selectedLead: Lead | null = null;
  showViewModal: boolean = false;
  parsedNotes: { [key: string]: string } = {};

  private employeesMap: Map<string, string> = new Map(); // employeeId → fullName
  private leadsMap: Map<string, Lead> = new Map(); // Store full lead objects
  private leadsSubscription?: Subscription;

  constructor(
    private router: Router,
    private leadsService: LeadsService,
    private employeeService: EmployeeService
  ) { }

  ngOnInit(): void {
    this.loadEmployees();
    this.loadLeads();

    // Subscribe to real-time updates
    this.leadsSubscription = this.leadsService.leadsUpdated$.subscribe(() => {
      console.log('Leads updated - waiting 1000ms for backend persistence...');
      setTimeout(() => {
        console.log('Refreshing admin leads list now');
        this.loadLeads();
      }, 1000);
    });
  }

  ngOnDestroy(): void {
    if (this.leadsSubscription) {
      this.leadsSubscription.unsubscribe();
    }
  }

  loadEmployees(): void {
    this.employeeService.getEmployeesByStatus('accept').subscribe({
      next: (employees: Employee[]) => {
        this.employeesMap.clear();
        employees.forEach(emp => {
          this.employeesMap.set(emp._id, emp.fullName);
        });
        console.log('Employees loaded for name mapping:', employees.length);
      },
      error: (err: any) => {
        console.error('Error loading employees:', err);
        this.errorMessage = 'Failed to load employee names';
      }
    });
  }

  loadLeads(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.leadsService.getAllLeads().subscribe({
      next: (allLeads: Lead[]) => {
        // Store full lead objects in map
        this.leadsMap.clear();
        allLeads.forEach(lead => {
          this.leadsMap.set(lead._id, lead);
        });

        // Show ALL leads in Admin view (both created and assigned)
        const displayLeads = allLeads;

        // Map to display format with employee name
        this.leads = displayLeads.map(lead => ({
          id: lead._id,
          name: lead.fullName,
          email: lead.email,
          phone: lead.phoneNumber,
          company: lead.companyName || '-',
          source: lead.leadSource,
          status: lead.status,
          assignedToName: (lead.assignedTo && this.employeesMap.get(lead.assignedTo)) ||
            (lead.createdBy && this.employeesMap.get(lead.createdBy)) ||
            'Unassigned'
        }));

        console.log('Admin total leads loaded:', this.leads.length);

        this.filteredLeads = [...this.leads];
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading leads:', err);
        this.errorMessage = 'Failed to load leads';
        this.isLoading = false;
      }
    });
  }

  applyFiltersAndSort(): void {
    this.filteredLeads = this.leads.filter(lead => {
      const matchesSearch = !this.searchTerm ||
        lead.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        lead.phone.includes(this.searchTerm) ||
        lead.company.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesSource = !this.sourceFilter || lead.source === this.sourceFilter;
      const matchesName = !this.nameFilter || lead.name.toLowerCase().includes(this.nameFilter.toLowerCase());

      return matchesSearch && matchesSource && matchesName;
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  filterByName(): void {
    this.applyFiltersAndSort();
  }


  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredLeads.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedLeads = this.filteredLeads.slice(start, end);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  assignLeads(): void {
    this.router.navigate(['/leads/assign']);
  }

  viewLead(leadId: string): void {
    this.router.navigate(['/leads', leadId]);
  }

  deleteLead(leadId: string): void {
    if (confirm(`Are you sure you want to delete this lead?`)) {
      this.leadsService.deleteLead(leadId).subscribe({
        next: () => {
          console.log(`Lead ${leadId} deleted`);
          this.loadLeads();
        },
        error: (err: any) => {
          console.error('Delete error:', err);
          alert('Failed to delete lead');
        }
      });
    }
  }

  // Modal functionality
  viewLeadModal(leadId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    const lead = this.leadsMap.get(leadId);
    if (lead) {
      this.selectedLead = lead;
      this.parseNotesForDisplay(lead);
      this.showViewModal = true;
    }
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedLead = null;
    this.parsedNotes = {};
  }

  // Parse notes field to extract structured data
  parseNotesForDisplay(lead: Lead): void {
    this.parsedNotes = {};

    if (!lead.notes) return;

    // Notes format: "Designation: Manager | Priority: high | Alt Phone: +91 1234567890 | ..."
    const parts = lead.notes.split(' | ');

    parts.forEach(part => {
      const [key, ...valueParts] = part.split(': ');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(': ').trim();
        this.parsedNotes[key.trim()] = value;
      }
    });

    console.log('Parsed notes:', this.parsedNotes);
  }

  // Helper methods to get specific fields from parsed notes
  getDesignation(): string {
    return this.parsedNotes['Designation'] || 'N/A';
  }

  getPriority(): string {
    return this.parsedNotes['Priority'] || 'medium';
  }

  getAlternatePhone(): string {
    return this.parsedNotes['Alt Phone'] || 'N/A';
  }

  getAddress(): string {
    return this.parsedNotes['Address'] || 'N/A';
  }

  getCity(): string {
    return this.parsedNotes['City'] || 'N/A';
  }

  getState(): string {
    return this.parsedNotes['State'] || 'N/A';
  }

  getPincode(): string {
    return this.parsedNotes['Pincode'] || 'N/A';
  }

  getProductInterest(): string {
    return this.parsedNotes['Product Interest'] || 'N/A';
  }

  getBudget(): string {
    const budget = this.parsedNotes['Budget'];
    return budget ? budget : 'N/A';
  }

  getTimeline(): string {
    return this.parsedNotes['Timeline'] || 'N/A';
  }

  getQuantity(): string {
    return this.parsedNotes['Quantity'] || 'N/A';
  }

  getPriorityClass(priority: string): string {
    const classes: { [key: string]: string } = {
      'low': 'priority-low',
      'medium': 'priority-medium',
      'high': 'priority-high'
    };
    return classes[priority.toLowerCase()] || 'priority-medium';
  }

  getPriorityIcon(priority: string): string {
    const icons: { [key: string]: string } = {
      'low': 'fa-flag',
      'medium': 'fa-flag',
      'high': 'fa-flag'
    };
    return icons[priority.toLowerCase()] || 'fa-flag';
  }

  getStatusClass(status: string): string {
    const statusClasses: { [key: string]: string } = {
      'seeded lead': 'status-seeded',
      'meeting fixed': 'status-fixed',
      'meeting completed': 'status-completed',
      'cs executed': 'status-executed'
    };
    return statusClasses[status.toLowerCase()] || '';
  }

  getStatusIcon(status: string): string {
    const statusIcons: { [key: string]: string } = {
      'seeded lead': 'fa-seedling',
      'meeting fixed': 'fa-calendar-plus',
      'meeting completed': 'fa-calendar-check',
      'cs executed': 'fa-file-signature'
    };
    return statusIcons[status.toLowerCase()] || 'fa-circle';
  }

  formatDate(date?: Date | string): string {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }
}