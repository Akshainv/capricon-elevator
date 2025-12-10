// src/app/features/deals/deal-pipeline/deal-pipeline.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Deal {
  id: string;
  title: string;
  company: string;
  amount: number;
  elevatorType: string;
  probability: number;
  closeDate: string;
  assignedTo: string;
  status: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
}

interface Column {
  title: string;
  status: string;
  color: string;
  deals: Deal[];
}

@Component({
  selector: 'app-deal-pipeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './deal-pipeline.component.html',
  styleUrls: ['./deal-pipeline.component.css']
})
export class DealPipelineComponent implements OnInit {
  allDeals: Deal[] = [];
  columns: Column[] = [];
  draggedDeal: Deal | null = null;
  wonDeals: Deal[] = [];

  constructor(public router: Router) {}

  ngOnInit(): void {
    this.initializeColumns();
    this.loadDeals();
    this.wonDeals = this.getWonDeals();
  }

  initializeColumns(): void {
    this.columns = [
      { title: 'Lead', status: 'lead', color: '#3b82f6', deals: [] },
      { title: 'Qualified', status: 'qualified', color: '#8b5cf6', deals: [] },
      { title: 'Proposal', status: 'proposal', color: '#f59e0b', deals: [] },
      { title: 'Negotiation', status: 'negotiation', color: '#ec4899', deals: [] }
    ];
  }

  loadDeals(): void {
    // Sample data with deals in all stages (excluding lost deals)
    this.allDeals = [
      {
        id: '1',
        title: 'Luxury Apartment Complex',
        company: 'Prestige Group',
        amount: 2500000,
        elevatorType: 'Passenger Elevator',
        probability: 75,
        closeDate: '2024-12-15',
        assignedTo: 'John Doe',
        status: 'proposal',
        contactPerson: 'Raj Kumar',
        phone: '+91 9876543210',
        email: 'raj@prestige.com'
      },
      {
        id: '2',
        title: 'Corporate Office Building',
        company: 'Tech Park Ltd',
        amount: 3200000,
        elevatorType: 'High-Speed Elevator',
        probability: 90,
        closeDate: '2024-11-30',
        assignedTo: 'Jane Smith',
        status: 'negotiation',
        contactPerson: 'Suresh Reddy',
        phone: '+91 9876543211',
        email: 'suresh@techpark.com'
      },
      {
        id: '3',
        title: 'Shopping Mall Expansion',
        company: 'Phoenix Mills',
        amount: 1800000,
        elevatorType: 'Freight Elevator',
        probability: 50,
        closeDate: '2025-01-20',
        assignedTo: 'Mike Johnson',
        status: 'qualified',
        contactPerson: 'Amit Shah',
        phone: '+91 9876543212',
        email: 'amit@phoenixmalls.com'
      },
      {
        id: '4',
        title: 'Sunrise Mall',
        company: 'Sunrise Mall Pvt Ltd',
        amount: 4500000,
        elevatorType: '15-Floor Passenger Elevator',
        probability: 100,
        closeDate: '2024-10-18',
        assignedTo: 'Amit Shah',
        status: 'won',
        contactPerson: 'John Smith',
        phone: '+91 9876543215',
        email: 'john@sunrisemall.com'
      },
      {
        id: '6',
        title: 'Residential Tower Project',
        company: 'Skyline Developers',
        amount: 3500000,
        elevatorType: 'Passenger Elevator',
        probability: 25,
        closeDate: '2025-02-10',
        assignedTo: 'Priya Sharma',
        status: 'lead',
        contactPerson: 'Vijay Singh',
        phone: '+91 9876543214',
        email: 'vijay@skyline.com'
      },
      {
        id: '7',
        title: 'Metro Station Project',
        company: 'Delhi Metro Rail Corporation',
        amount: 5500000,
        elevatorType: 'Heavy-Duty Escalator',
        probability: 100,
        closeDate: '2024-08-25',
        assignedTo: 'Rajesh Kumar',
        status: 'won',
        contactPerson: 'Deepak Verma',
        phone: '+91 9876543216',
        email: 'deepak@dmrc.com'
      },
      {
        id: '8',
        title: 'Hospital Modernization',
        company: 'City General Hospital',
        amount: 2800000,
        elevatorType: 'Medical Elevator',
        probability: 100,
        closeDate: '2024-09-10',
        assignedTo: 'Priya Sharma',
        status: 'won',
        contactPerson: 'Dr. Sharma',
        phone: '+91 9876543217',
        email: 'admin@cityhospital.com'
      },
      {
        id: '9',
        title: 'Premium Residential Complex',
        company: 'Godrej Properties',
        amount: 4200000,
        elevatorType: 'High-Speed Passenger Elevator',
        probability: 100,
        closeDate: '2024-07-20',
        assignedTo: 'John Doe',
        status: 'won',
        contactPerson: 'Rahul Mehta',
        phone: '+91 9876543218',
        email: 'rahul@godrej.com'
      },
      {
        id: '10',
        title: 'Corporate Tech Hub',
        company: 'Infosys Campus',
        amount: 6800000,
        elevatorType: 'Smart Elevator System',
        probability: 100,
        closeDate: '2024-06-15',
        assignedTo: 'Jane Smith',
        status: 'won',
        contactPerson: 'Anita Singh',
        phone: '+91 9876543219',
        email: 'anita@infosys.com'
      }
    ];

    this.organizeDeals();
  }

  organizeDeals(): void {
    // Clear all columns first
    this.columns.forEach(column => {
      column.deals = [];
    });

    // Distribute deals to columns (only active deals, not won)
    this.allDeals.forEach(deal => {
      if (deal.status !== 'won') {
        const column = this.columns.find(col => col.status === deal.status);
        if (column) {
          column.deals.push(deal);
        }
      }
    });

    // Update won deals
    this.wonDeals = this.getWonDeals();
  }

  // Get won deals only
  getWonDeals(): Deal[] {
    return this.allDeals.filter(deal => deal.status === 'won');
  }

  // Total value methods
  getTotalWonValue(): number {
    return this.getWonDeals().reduce((sum, deal) => sum + deal.amount, 0);
  }

  // Drag and Drop Methods
  onDragStart(event: DragEvent, deal: Deal): void {
    this.draggedDeal = deal;
    event.dataTransfer!.effectAllowed = 'move';
    console.log('Drag started:', deal.title);
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
  }

  onDrop(event: DragEvent, newStatus: string): void {
    event.preventDefault();
    
    if (this.draggedDeal) {
      console.log(`Moving ${this.draggedDeal.title} from ${this.draggedDeal.status} to ${newStatus}`);
      
      // Update the deal status
      this.draggedDeal.status = newStatus;
      
      // Update probability based on status
      if (newStatus === 'won') {
        this.draggedDeal.probability = 100;
      }
      
      // Reorganize deals into columns
      this.organizeDeals();
      
      // Clear dragged deal
      this.draggedDeal = null;
      
      console.log('Deal moved successfully');
    }
  }

  // Convert Deal to Project
  convertToProject(deal: Deal): void {
    console.log('Converting deal to project:', deal);
    
    this.router.navigate(['/projects/create'], { 
      state: { 
        deal: {
          id: deal.id,
          title: deal.title,
          company: deal.company,
          amount: deal.amount,
          elevatorType: deal.elevatorType,
          contactPerson: deal.contactPerson || deal.assignedTo,
          phone: deal.phone || '+91 9876543210',
          email: deal.email || 'contact@example.com'
        }
      } 
    });
  }

  // View Deal Details
  viewDealDetails(deal: Deal): void {
    console.log('Viewing deal:', deal);
    this.router.navigate(['/deals', deal.id]);
  }

  // Utility Methods
  getColumnCount(column: Column): number {
    return column.deals.length;
  }

  getColumnTotal(column: Column): number {
    return column.deals.reduce((sum, deal) => sum + deal.amount, 0);
  }

  getTotalPipelineValue(): number {
    return this.allDeals
      .filter(deal => deal.status !== 'won')
      .reduce((sum, deal) => sum + deal.amount, 0);
  }

  getWonDealsValue(): number {
    return this.allDeals
      .filter(deal => deal.status === 'won')
      .reduce((sum, deal) => sum + deal.amount, 0);
  }

  getActiveDealsCount(): number {
    return this.allDeals.filter(deal => deal.status !== 'won').length;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  }

  getStatusBadgeClass(status: string): string {
    return `status-${status}`;
  }
}