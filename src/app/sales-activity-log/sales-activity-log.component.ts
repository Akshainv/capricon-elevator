// src/app/features/communication/sales-activity-log/sales-activity-log.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'site_visit';
  title: string;
  description: string;
  timestamp: Date;
  duration?: string;
  outcome?: string;
  nextAction?: string;
  attachment?: string;
  leadId?: string;
  leadName?: string;
  dealId?: string;
  dealName?: string;
}

@Component({
  selector: 'app-sales-activity-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './sales-activity-log.component.html',
  styleUrls: ['./sales-activity-log.component.css']
})
export class SalesActivityLogComponent implements OnInit {
  activityForm!: FormGroup;
  showAddForm: boolean = false;
  filterType: string = '';
  filterDate: string = 'all';
  searchQuery: string = '';

  // Mock data - Replace with actual service
  currentUser = 'Rajesh Kumar'; // Get from AuthService

  activities: Activity[] = [
    {
      id: '1',
      type: 'call',
      title: 'Follow-up Call - Product Demo',
      description: 'Discussed technical specifications for 8-floor passenger elevator. Customer expressed interest in VFD drive system. Explained energy-saving benefits and maintenance packages.',
      timestamp: new Date('2024-12-02T14:30:00'),
      duration: '25 mins',
      outcome: 'Positive - Customer interested',
      nextAction: 'Send detailed quotation by Dec 5',
      leadId: 'LD-2024-001',
      leadName: 'ABC Corporation - John Smith'
    },
    {
      id: '2',
      type: 'email',
      title: 'Quotation Sent - Industrial Elevator',
      description: 'Sent comprehensive quotation for 10-floor goods elevator with 2000kg capacity. Included detailed specifications, pricing breakdown, installation timeline, and warranty terms.',
      timestamp: new Date('2024-12-02T11:15:00'),
      attachment: 'Quote_ABC_2024_001.pdf',
      outcome: 'Awaiting response',
      nextAction: 'Follow-up call on Dec 4',
      leadId: 'LD-2024-001',
      leadName: 'ABC Corporation - John Smith'
    },
    {
      id: '3',
      type: 'site_visit',
      title: 'Site Survey - New Construction',
      description: 'Conducted detailed site inspection at customer location. Measured shaft dimensions (2.5m x 2.5m), checked electrical capacity, assessed installation challenges. Client wants premium finish with glass cabin.',
      timestamp: new Date('2024-12-01T10:00:00'),
      duration: '2 hours',
      outcome: 'Site suitable for installation',
      nextAction: 'Prepare customized quotation',
      leadId: 'LD-2024-002',
      leadName: 'XYZ Developers - Sarah Johnson'
    },
    {
      id: '4',
      type: 'meeting',
      title: 'Client Meeting - Budget Discussion',
      description: 'Met with procurement team to discuss budget constraints. Presented alternative models within their budget range. Explained cost-benefit analysis of different elevator types.',
      timestamp: new Date('2024-11-30T15:00:00'),
      duration: '1 hour',
      outcome: 'Customer considering options',
      nextAction: 'Send revised quote with 3 options',
      leadId: 'LD-2024-003',
      leadName: 'Tech Park Ltd - Michael Brown'
    },
    {
      id: '5',
      type: 'call',
      title: 'Initial Inquiry Call',
      description: 'Customer called about elevator options for 12-floor residential building. Discussed passenger capacity requirements, speed preferences, and budget range.',
      timestamp: new Date('2024-11-29T16:30:00'),
      duration: '15 mins',
      outcome: 'Hot lead - Ready to proceed',
      nextAction: 'Schedule site visit on Dec 3',
      leadId: 'LD-2024-004',
      leadName: 'Green Heights - Emily Davis'
    },
    {
      id: '6',
      type: 'email',
      title: 'Technical Documentation Shared',
      description: 'Sent detailed product catalogs, technical specifications, compliance certificates, and case studies of similar installations.',
      timestamp: new Date('2024-11-28T09:30:00'),
      attachment: 'Technical_Docs.zip',
      outcome: 'Information provided',
      nextAction: 'Follow-up call scheduled',
      leadId: 'LD-2024-005',
      leadName: 'Metro Mall - David Wilson'
    },
    {
      id: '7',
      type: 'meeting',
      title: 'Deal Negotiation Meeting',
      description: 'Final negotiation meeting with decision makers. Discussed payment terms, installation timeline, AMC contract, and warranty details. Customer ready to sign.',
      timestamp: new Date('2024-11-27T14:00:00'),
      duration: '1.5 hours',
      outcome: 'Deal closing - 80% confirmed',
      nextAction: 'Send final agreement for signature',
      dealId: 'DL-2024-001',
      dealName: 'ABC Corp Elevator Deal - ₹45L'
    }
  ];

  filteredActivities: Activity[] = [];

  activityTypes = [
    { value: 'call', label: 'Phone Call', icon: 'fa-phone' },
    { value: 'email', label: 'Email', icon: 'fa-envelope' },
    { value: 'meeting', label: 'Meeting', icon: 'fa-users' },
    { value: 'site_visit', label: 'Site Visit', icon: 'fa-map-marker-alt' }
  ];

  outcomeOptions = [
    'Positive - Customer interested',
    'Awaiting response',
    'Need more information',
    'Budget concerns',
    'Competitor comparison',
    'Hot lead - Ready to proceed',
    'Cold - Not interested',
    'Deal closing soon'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.filterActivities();
  }

  initForm(): void {
    this.activityForm = this.fb.group({
      type: ['call', Validators.required],
      title: ['', Validators.required],
      description: ['', Validators.required],
      duration: [''],
      outcome: [''],
      nextAction: [''],
      leadId: ['']
    });

    // Add listener to clear duration when email is selected
    this.activityForm.get('type')?.valueChanges.subscribe(type => {
      if (type === 'email') {
        this.activityForm.patchValue({ duration: '' });
      }
    });
  }

  shouldShowDuration(): boolean {
    return this.activityForm.get('type')?.value !== 'email';
  }

  filterActivities(): void {
    this.filteredActivities = this.activities.filter(activity => {
      const matchesType = !this.filterType || activity.type === this.filterType;
      const matchesDate = this.matchesDateFilter(activity.timestamp);
      const matchesSearch = this.matchesSearchQuery(activity);
      return matchesType && matchesDate && matchesSearch;
    });

    // Sort by most recent first
    this.filteredActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  matchesDateFilter(date: Date): boolean {
    if (this.filterDate === 'all') return true;
    
    const now = new Date();
    const activityDate = new Date(date);
    
    switch (this.filterDate) {
      case 'today':
        return activityDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return activityDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return activityDate >= monthAgo;
      default:
        return true;
    }
  }

  matchesSearchQuery(activity: Activity): boolean {
    if (!this.searchQuery || this.searchQuery.trim() === '') return true;
    
    const query = this.searchQuery.toLowerCase();
    const searchableFields = [
      activity.title,
      activity.description,
      activity.leadName || '',
      activity.dealName || ''
    ];
    
    return searchableFields.some(field => 
      field.toLowerCase().includes(query)
    );
  }

  filterByType(type: string): void {
    this.filterType = this.filterType === type ? '' : type;
    this.filterActivities();
  }

  filterByDate(period: string): void {
    this.filterDate = period;
    this.filterActivities();
  }

  onSearchChange(event: any): void {
    this.searchQuery = event.target.value;
    this.filterActivities();
  }

  toggleAddForm(): void {
    this.showAddForm = !this.showAddForm;
    if (!this.showAddForm) {
      this.activityForm.reset({ type: 'call' });
    }
  }

  onSubmit(): void {
    if (this.activityForm.valid) {
      const formData = this.activityForm.value;
      
      const newActivity: Activity = {
        id: Date.now().toString(),
        type: formData.type,
        title: formData.title,
        description: formData.description,
        timestamp: new Date(),
        duration: formData.duration,
        outcome: formData.outcome,
        nextAction: formData.nextAction,
        leadId: formData.leadId
      };

      this.activities.unshift(newActivity);
      this.filterActivities();
      this.toggleAddForm();
      
      alert('Activity logged successfully!');
    }
  }

  getActivityIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'call': 'fa-phone',
      'email': 'fa-envelope',
      'meeting': 'fa-users',
      'site_visit': 'fa-map-marker-alt'
    };
    return icons[type] || 'fa-circle';
  }

  getActivityColor(type: string): string {
    const colors: { [key: string]: string } = {
      'call': '#60a5fa',
      'email': '#c084fc',
      'meeting': '#fb923c',
      'site_visit': '#4ade80'
    };
    return colors[type] || '#d4b347';
  }

  formatDate(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
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
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  viewLead(leadId: string): void {
    this.router.navigate(['/leads', leadId]);
  }

  viewDeal(dealId: string): void {
    this.router.navigate(['/deals', dealId]);
  }

  deleteActivity(activityId: string): void {
    if (confirm('Are you sure you want to delete this activity?')) {
      this.activities = this.activities.filter(a => a.id !== activityId);
      this.filterActivities();
    }
  }

  exportActivities(): void {
    const csvHeaders = ['Date', 'Type', 'Title', 'Description', 'Duration', 'Outcome', 'Next Action', 'Lead/Deal'];
    const csvRows = this.filteredActivities.map(a => [
      a.timestamp.toLocaleString(),
      a.type,
      a.title,
      a.description,
      a.duration || '-',
      a.outcome || '-',
      a.nextAction || '-',
      a.leadName || a.dealName || '-'
    ].map(field => `"${field}"`).join(','));

    const csvContent = [csvHeaders.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `activity_log_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
  }

  getActivityStats() {
    const stats = {
      total: this.activities.length,
      calls: this.activities.filter(a => a.type === 'call').length,
      emails: this.activities.filter(a => a.type === 'email').length,
      meetings: this.activities.filter(a => a.type === 'meeting').length,
      siteVisits: this.activities.filter(a => a.type === 'site_visit').length
    };
    return stats;
  }
}