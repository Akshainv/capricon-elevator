// src/app/features/leads/sales-leads-list/sales-leads-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  source: string;
  status: string;
  priority: string;
  lastContact: string;
  nextFollowUp: string;
  assignedDate: string;
  value: number;
}
@Component({
  selector: 'app-sales-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-leads.component.html',  // ✅ CORRECT
  styleUrls: ['./sales-leads.component.css']    // ✅ CORRECT
})
export class SalesLeadsListComponent implements OnInit {
  searchTerm: string = '';
  statusFilter: string = '';
  sourceFilter: string = '';
  priorityFilter: string = '';
  sortBy: string = 'recent';
  viewMode: string = 'grid'; // 'grid' or 'table'

  // Mock current sales executive name
  currentExecutive: string = 'Sales Executive';

  leads: Lead[] = [
    {
      id: 'LD-2024-001',
      name: 'John Smith',
      email: 'john@example.com',
      phone: '+91 9876543210',
      company: 'ABC Corporation',
      source: 'Website',
      status: 'new',
      priority: 'high',
      lastContact: '2024-12-01',
      nextFollowUp: '2024-12-03',
      assignedDate: '2024-11-28',
      value: 150000
    },
    {
      id: 'LD-2024-002',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      phone: '+91 9876543211',
      company: 'XYZ Industries',
      source: 'Walk-in',
      status: 'qualified',
      priority: 'medium',
      lastContact: '2024-11-30',
      nextFollowUp: '2024-12-05',
      assignedDate: '2024-11-25',
      value: 200000
    },
    {
      id: 'LD-2024-003',
      name: 'Michael Brown',
      email: 'michael@example.com',
      phone: '+91 9876543212',
      company: 'Tech Solutions',
      source: 'Reference',
      status: 'quoted',
      priority: 'high',
      lastContact: '2024-12-01',
      nextFollowUp: '2024-12-02',
      assignedDate: '2024-11-20',
      value: 350000
    },
    {
      id: 'LD-2024-004',
      name: 'Emily Davis',
      email: 'emily@example.com',
      phone: '+91 9876543213',
      company: 'Global Enterprises',
      source: 'Phone',
      status: 'negotiation',
      priority: 'high',
      lastContact: '2024-11-29',
      nextFollowUp: '2024-12-02',
      assignedDate: '2024-11-18',
      value: 500000
    },
    {
      id: 'LD-2024-005',
      name: 'David Wilson',
      email: 'david@example.com',
      phone: '+91 9876543214',
      company: 'Innovation Hub',
      source: 'Website',
      status: 'new',
      priority: 'low',
      lastContact: '2024-11-28',
      nextFollowUp: '2024-12-04',
      assignedDate: '2024-11-27',
      value: 80000
    },
    {
      id: 'LD-2024-006',
      name: 'Jessica Martinez',
      email: 'jessica@example.com',
      phone: '+91 9876543215',
      company: 'Digital Systems',
      source: 'Walk-in',
      status: 'qualified',
      priority: 'medium',
      lastContact: '2024-11-30',
      nextFollowUp: '2024-12-03',
      assignedDate: '2024-11-22',
      value: 180000
    }
  ];

  filteredLeads: Lead[] = [];
  todayFollowUps: number = 0;
  overdueFollowUps: number = 0;
  hotLeads: number = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.filteredLeads = [...this.leads];
    this.calculateStats();
    this.sortLeads();
  }

  calculateStats(): void {
    const today = new Date().toISOString().split('T')[0];
    
    this.todayFollowUps = this.leads.filter(lead => 
      lead.nextFollowUp === today
    ).length;
    
    this.overdueFollowUps = this.leads.filter(lead => 
      lead.nextFollowUp < today
    ).length;
    
    this.hotLeads = this.leads.filter(lead => 
      lead.priority === 'high' && (lead.status === 'qualified' || lead.status === 'quoted' || lead.status === 'negotiation')
    ).length;
  }

  filterLeads(): void {
    this.filteredLeads = this.leads.filter(lead => {
      const matchesSearch = !this.searchTerm || 
        lead.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        lead.phone.includes(this.searchTerm) ||
        lead.company.toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = !this.statusFilter || lead.status === this.statusFilter;
      const matchesSource = !this.sourceFilter || lead.source === this.sourceFilter;
      const matchesPriority = !this.priorityFilter || lead.priority === this.priorityFilter;

      return matchesSearch && matchesStatus && matchesSource && matchesPriority;
    });
    
    this.sortLeads();
  }

  sortLeads(): void {
    switch(this.sortBy) {
      case 'recent':
        this.filteredLeads.sort((a, b) => 
          new Date(b.assignedDate).getTime() - new Date(a.assignedDate).getTime()
        );
        break;
      case 'followup':
        this.filteredLeads.sort((a, b) => 
          new Date(a.nextFollowUp).getTime() - new Date(b.nextFollowUp).getTime()
        );
        break;
      case 'value':
        this.filteredLeads.sort((a, b) => b.value - a.value);
        break;
      case 'priority':
        const priorityOrder: { [key: string]: number } = { 'high': 1, 'medium': 2, 'low': 3 };
        this.filteredLeads.sort((a, b) => 
          priorityOrder[a.priority] - priorityOrder[b.priority]
        );
        break;
    }
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'new': 'New',
      'contacted': 'Contacted',
      'qualified': 'Qualified',
      'quoted': 'Quoted',
      'negotiation': 'Negotiation',
      'won': 'Won',
      'lost': 'Lost'
    };
    return labels[status] || status;
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  getPriorityLabel(priority: string): string {
    const labels: { [key: string]: string } = {
      'high': 'High Priority',
      'medium': 'Medium',
      'low': 'Low'
    };
    return labels[priority] || priority;
  }

  isFollowUpToday(date: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return date === today;
  }

  isFollowUpOverdue(date: string): boolean {
    const today = new Date().toISOString().split('T')[0];
    return date < today;
  }

  formatCurrency(value: number): string {
    return '₹' + value.toLocaleString('en-IN');
  }

  addNewLead(): void {
    this.router.navigate(['/leads/add']);
  }

  viewLead(leadId: string): void {
    this.router.navigate(['/leads', leadId]);
  }

  editLead(leadId: string): void {
    this.router.navigate(['/leads/edit', leadId]);
  }

  addActivity(leadId: string, event: Event): void {
    event.stopPropagation();
    console.log('Add activity for lead:', leadId);
    // Navigate to activity page or open modal
    alert('Add Activity feature - Coming soon!');
  }

  createQuote(leadId: string, event: Event): void {
    event.stopPropagation();
    console.log('Create quote for lead:', leadId);
    this.router.navigate(['/quotations/create'], { queryParams: { leadId } });
  }

  toggleViewMode(): void {
    this.viewMode = this.viewMode === 'grid' ? 'table' : 'grid';
  }
}