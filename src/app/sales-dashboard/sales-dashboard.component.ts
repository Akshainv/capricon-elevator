// src/app/features/dashboard/sales-dashboard/sales-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface StatCard {
  icon: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  route?: string;
}

interface RecentLead {
  id: string;
  name: string;
  company: string;
  status: string;
  value: string;
  date: string;
  assignedDate: string;
}

interface Task {
  id: string;
  title: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  type: 'call' | 'email' | 'meeting' | 'task';
  completed: boolean;
}

interface Quotation {
  id: string;
  customer: string;
  amount: string;
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'pending';
  date: string;
  validUntil: string;
}

interface PipelineStage {
  name: string;
  count: number;
  value: string;
  color: string;
  percentage: number;
}

interface Activity {
  id: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  title: string;
  leadName: string;
  time: string;
  status: 'completed' | 'scheduled';
}

interface ActivityDistribution {
  label: string;
  count: number;
  icon: string;
  color: string;
}

interface LeadSource {
  name: string;
  percentage: number;
  count: number;
  color: string;
}

interface TopProduct {
  name: string;
  sales: number;
  revenue: string;
  trend: 'up' | 'down' | 'neutral';
}

@Component({
  selector: 'app-sales-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-dashboard.component.html',
  styleUrls: ['./sales-dashboard.component.css']
})
export class SalesDashboardComponent implements OnInit {
  userName: string = 'Sales Executive';
  userEmail: string = '';
  currentDate: Date = new Date();
  greetingMessage: string = '';

  // 8 Key metric cards - Sales Executive's personal metrics
  stats: StatCard[] = [
    { 
      icon: 'fa-chart-line', 
      label: 'My Monthly Revenue', 
      value: '₹12.5L', 
      change: '+15.2%', 
      trend: 'up',
      route: '/reports/performance'
    },
    { 
      icon: 'fa-users', 
      label: 'My Assigned Leads', 
      value: '84', 
      change: '+12 new', 
      trend: 'up',
      route: '/leads'
    },
    { 
      icon: 'fa-file-invoice', 
      label: 'My Quotations', 
      value: '23', 
      change: '8 pending', 
      trend: 'neutral',
      route: '/quotations'
    },
    { 
      icon: 'fa-handshake', 
      label: 'My Active Deals', 
      value: '31', 
      change: '5 in negotiation', 
      trend: 'up',
      route: '/deals'
    },
    { 
      icon: 'fa-trophy', 
      label: 'My Conversion Rate', 
      value: '28%', 
      change: '+5% this month', 
      trend: 'up',
      route: '/reports/performance'
    },
    { 
      icon: 'fa-tasks', 
      label: 'Pending Tasks', 
      value: '17', 
      change: '5 due today', 
      trend: 'neutral',
      route: '/tasks'
    },
    { 
      icon: 'fa-bullseye', 
      label: 'Target Achievement', 
      value: '75%', 
      change: '₹9.4L of ₹12.5L', 
      trend: 'up',
      route: '/reports/performance'
    },
    { 
      icon: 'fa-calendar-check', 
      label: 'Follow-ups Due', 
      value: '12', 
      change: '8 overdue', 
      trend: 'down',
      route: '/activities'
    }
  ];

  // Pipeline Overview with 5 stages - My deals only
  pipelineStages: PipelineStage[] = [
    { name: 'New Leads', count: 18, value: '₹25.2L', color: '#3b82f6', percentage: 20 },
    { name: 'Qualified', count: 15, value: '₹38.5L', color: '#f59e0b', percentage: 35 },
    { name: 'Quoted', count: 12, value: '₹42.3L', color: '#8b5cf6', percentage: 50 },
    { name: 'Negotiation', count: 8, value: '₹28.7L', color: '#ec4899', percentage: 70 },
    { name: 'Won', count: 6, value: '₹18.8L', color: '#22c55e', percentage: 100 }
  ];

  // Lead Sources distribution - Where my leads come from
  leadSources: LeadSource[] = [
    { name: 'Website Inquiry', percentage: 40, count: 34, color: '#3b82f6' },
    { name: 'Walk-in Customer', percentage: 30, count: 25, color: '#f59e0b' },
    { name: 'Reference/Referral', percentage: 20, count: 17, color: '#8b5cf6' },
    { name: 'Others', percentage: 10, count: 8, color: '#ec4899' }
  ];

  // Top Products - What I'm selling most
  topProducts: TopProduct[] = [
    { name: 'Passenger Elevator (8-Floor)', sales: 12, revenue: '₹45L', trend: 'up' },
    { name: 'Home Lift (5-Floor)', sales: 8, revenue: '₹28L', trend: 'up' },
    { name: 'Goods Elevator (10-Floor)', sales: 6, revenue: '₹35L', trend: 'neutral' },
    { name: 'Hospital Elevator', sales: 4, revenue: '₹22L', trend: 'down' }
  ];

  // Recent Leads - My latest assigned leads (6 items)
  recentLeads: RecentLead[] = [
    { 
      id: 'LD-2024-145', 
      name: 'ABC Corporation', 
      company: 'Tech Industry', 
      status: 'New', 
      value: '₹18L', 
      date: '2 hours ago',
      assignedDate: 'Dec 02, 2024'
    },
    { 
      id: 'LD-2024-144', 
      name: 'XYZ Industries', 
      company: 'Manufacturing', 
      status: 'Qualified', 
      value: '₹25L', 
      date: '5 hours ago',
      assignedDate: 'Dec 02, 2024'
    },
    { 
      id: 'LD-2024-143', 
      name: 'Green Apartments', 
      company: 'Real Estate', 
      status: 'Quoted', 
      value: '₹12L', 
      date: '1 day ago',
      assignedDate: 'Dec 01, 2024'
    },
    { 
      id: 'LD-2024-142', 
      name: 'Metro Hospital', 
      company: 'Healthcare', 
      status: 'Negotiation', 
      value: '₹35L', 
      date: '2 days ago',
      assignedDate: 'Nov 30, 2024'
    },
    { 
      id: 'LD-2024-141', 
      name: 'Tech Park Builders', 
      company: 'Real Estate', 
      status: 'Qualified', 
      value: '₹42L', 
      date: '3 days ago',
      assignedDate: 'Nov 29, 2024'
    },
    { 
      id: 'LD-2024-140', 
      name: 'City Mall Complex', 
      company: 'Commercial', 
      status: 'New', 
      value: '₹28L', 
      date: '4 days ago',
      assignedDate: 'Nov 28, 2024'
    }
  ];

  // My Tasks Today (6 items with priority and completion status)
  todayTasks: Task[] = [
    { 
      id: 'TSK-001', 
      title: 'Follow-up call with ABC Corporation - Discuss pricing', 
      time: '10:00 AM', 
      priority: 'high', 
      type: 'call',
      completed: false 
    },
    { 
      id: 'TSK-002', 
      title: 'Send quotation to XYZ Industries - 8 Floor Elevator', 
      time: '11:30 AM', 
      priority: 'high', 
      type: 'email',
      completed: false 
    },
    { 
      id: 'TSK-003', 
      title: 'Site visit at Green Apartments - Technical survey', 
      time: '2:00 PM', 
      priority: 'medium', 
      type: 'meeting',
      completed: false 
    },
    { 
      id: 'TSK-004', 
      title: 'Update deal status for Metro Hospital in CRM', 
      time: '4:00 PM', 
      priority: 'low', 
      type: 'task',
      completed: false 
    },
    { 
      id: 'TSK-005', 
      title: 'Prepare presentation for Tech Park Builders meeting', 
      time: '5:00 PM', 
      priority: 'medium', 
      type: 'task',
      completed: false 
    },
    { 
      id: 'TSK-006', 
      title: 'Send follow-up email to City Mall Complex', 
      time: '6:00 PM', 
      priority: 'low', 
      type: 'email',
      completed: false 
    }
  ];

  // Recent Quotations (6 items with detailed status)
  recentQuotations: Quotation[] = [
    { 
      id: 'QT-2024-089', 
      customer: 'ABC Corporation', 
      amount: '₹18.5L', 
      status: 'sent', 
      date: 'Today',
      validUntil: 'Dec 12, 2024'
    },
    { 
      id: 'QT-2024-088', 
      customer: 'XYZ Industries', 
      amount: '₹25.2L', 
      status: 'approved', 
      date: 'Yesterday',
      validUntil: 'Dec 15, 2024'
    },
    { 
      id: 'QT-2024-087', 
      customer: 'Green Apartments', 
      amount: '₹12.8L', 
      status: 'pending', 
      date: '2 days ago',
      validUntil: 'Dec 10, 2024'
    },
    { 
      id: 'QT-2024-086', 
      customer: 'Metro Hospital', 
      amount: '₹35.0L', 
      status: 'sent', 
      date: '3 days ago',
      validUntil: 'Dec 18, 2024'
    },
    { 
      id: 'QT-2024-085', 
      customer: 'Tech Park Builders', 
      amount: '₹42.5L', 
      status: 'draft', 
      date: '4 days ago',
      validUntil: 'Dec 20, 2024'
    },
    { 
      id: 'QT-2024-084', 
      customer: 'City Mall Complex', 
      amount: '₹28.0L', 
      status: 'rejected', 
      date: '5 days ago',
      validUntil: 'Expired'
    }
  ];

  // Recent Activities - Communication history
  recentActivities: Activity[] = [
    { 
      id: 'ACT-001', 
      type: 'call', 
      title: 'Discussed project timeline and delivery', 
      leadName: 'ABC Corporation',
      time: '1 hour ago',
      status: 'completed'
    },
    { 
      id: 'ACT-002', 
      type: 'email', 
      title: 'Sent product brochure and pricing details', 
      leadName: 'XYZ Industries',
      time: '3 hours ago',
      status: 'completed'
    },
    { 
      id: 'ACT-003', 
      type: 'meeting', 
      title: 'Client meeting scheduled for site inspection', 
      leadName: 'Green Apartments',
      time: 'Tomorrow 2:00 PM',
      status: 'scheduled'
    },
    { 
      id: 'ACT-004', 
      type: 'call', 
      title: 'Follow-up call regarding quotation approval', 
      leadName: 'Metro Hospital',
      time: 'Tomorrow 4:00 PM',
      status: 'scheduled'
    }
  ];

  // Activity Distribution
  activityDistribution: ActivityDistribution[] = [
    { label: 'Calls', count: 45, icon: 'fa-phone', color: '#3b82f6' },
    { label: 'Emails', count: 67, icon: 'fa-envelope', color: '#f59e0b' },
    { label: 'Meetings', count: 23, icon: 'fa-users', color: '#8b5cf6' },
    { label: 'Tasks', count: 89, icon: 'fa-tasks', color: '#22c55e' }
  ];

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadUserInfo();
    this.setGreeting();
  }

  loadUserInfo(): void {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userName = user.name || 'Sales Executive';
        this.userEmail = user.email || '';
      } catch (e) {
        console.error('Error parsing user data:', e);
      }
    }
  }

  setGreeting(): void {
    const hour = this.currentDate.getHours();
    if (hour < 12) {
      this.greetingMessage = 'Good Morning';
    } else if (hour < 17) {
      this.greetingMessage = 'Good Afternoon';
    } else {
      this.greetingMessage = 'Good Evening';
    }
  }

  navigateTo(route: string): void {
    if (route) {
      this.router.navigate([route]);
    }
  }

  viewLeadDetail(leadId: string): void {
    this.router.navigate(['/leads', leadId]);
  }

  viewQuotationDetail(quoteId: string): void {
    this.router.navigate(['/quotations', quoteId]);
  }

  toggleTaskComplete(task: Task): void {
    task.completed = !task.completed;
    // In real app, update backend
  }

  getStatusClass(status: string): string {
    const statusMap: { [key: string]: string } = {
      'New': 'status-new',
      'Qualified': 'status-qualified',
      'Quoted': 'status-quoted',
      'Negotiation': 'status-negotiation',
      'Won': 'status-won',
      'Lost': 'status-lost',
      'draft': 'status-draft',
      'sent': 'status-sent',
      'approved': 'status-approved',
      'rejected': 'status-rejected',
      'pending': 'status-pending',
      'completed': 'status-completed',
      'scheduled': 'status-scheduled'
    };
    return statusMap[status] || '';
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  getTaskIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      'call': 'fa-phone',
      'email': 'fa-envelope',
      'meeting': 'fa-users',
      'task': 'fa-tasks',
      'note': 'fa-sticky-note'
    };
    return iconMap[type] || 'fa-check';
  }

  getActivityIcon(type: string): string {
    return this.getTaskIcon(type);
  }

  getTrendIcon(trend: string): string {
    if (trend === 'up') return 'fa-arrow-up';
    if (trend === 'down') return 'fa-arrow-down';
    return 'fa-minus';
  }
}