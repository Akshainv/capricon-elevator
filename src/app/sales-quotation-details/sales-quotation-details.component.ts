// src/app/sales-quotation-details/sales-quotation-details.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

interface QuotationItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Customer {
  name: string;
  company: string;
  email: string;
  phone: string;
  address: string;
}

interface QuotationData {
  id: string;
  quoteNumber: string;
  date: string;
  validUntil: string;
  customer: Customer;
  items: QuotationItem[];
  subtotal: number;
  cgst: number;
  sgst: number;
  total: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
}

@Component({
  selector: 'app-sales-quotation-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-quotation-details.component.html',
  styleUrls: ['./sales-quotation-details.component.css']
})
export class SalesQuotationDetailsComponent implements OnInit {
  quotationData: QuotationData = {
    id: '1',
    quoteNumber: 'QT-2024-001',
    date: 'Nov 15, 2024',
    validUntil: 'Dec 15, 2024',
    status: 'sent',
    customer: {
      name: 'John Smith',
      company: 'ABC Corporation',
      email: 'john@example.com',
      phone: '+91 9876543210',
      address: 'Infopark, Kochi, Kerala - 682042'
    },
    items: [
      {
        description: '8-Floor Passenger Elevator',
        quantity: 1,
        rate: 1200000,
        amount: 1200000
      },
      {
        description: 'VFD Control System',
        quantity: 1,
        rate: 150000,
        amount: 150000
      },
      {
        description: 'Installation & Commissioning',
        quantity: 1,
        rate: 200000,
        amount: 200000
      },
      {
        description: '1 Year AMC',
        quantity: 1,
        rate: 50000,
        amount: 50000
      }
    ],
    subtotal: 1550000,
    cgst: 139500,
    sgst: 139500,
    total: 1829000
  };

  companyInfo = {
    name: 'Capricorn Elevators',
    address: '11th floor, Jomer Symphony, Unit 03, Ponnurunni East, Vyttila, Ernakulam, Kerala 682019',
    phone: '075930 00222',
    website: 'capricornelevators.com',
    gst: 'GST123456789'
  };

  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.loadQuotationData();
  }

  loadQuotationData(): void {
    // Get quotation ID from route params
    const quotationId = this.route.snapshot.paramMap.get('id');
    
    if (quotationId) {
      // TODO: Load from service
      // this.quotationService.getQuotationById(quotationId).subscribe(data => {
      //   this.quotationData = data;
      // });
      console.log('Loading quotation with ID:', quotationId);
    }

    // Check if data passed via navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      const quotationData = navigation.extras.state['quotationData'];
      if (quotationData) {
        this.quotationData = quotationData;
      }
    }
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      'draft': 'Draft',
      'sent': 'Sent',
      'approved': 'Approved',
      'rejected': 'Rejected'
    };
    return labels[status] || status;
  }

  downloadPDF(): void {
    console.log('Downloading PDF...');
    alert(`Downloading ${this.quotationData.quoteNumber}.pdf`);
  }

  sendEmail(): void {
    if (this.quotationData.status === 'draft') {
      alert('Please complete the quotation before sending');
      return;
    }
    console.log('Sending email to:', this.quotationData.customer.email);
    alert(`Email sent to ${this.quotationData.customer.email} successfully!`);
  }

  editQuotation(): void {
    if (this.quotationData.status !== 'draft') {
      const confirmEdit = confirm('This quotation has already been sent. Do you want to create a duplicate to edit?');
      if (!confirmEdit) return;
    }
    
    this.router.navigate(['/quotations/edit', this.quotationData.id]);
  }

  duplicateQuotation(): void {
    console.log('Duplicating quotation:', this.quotationData.quoteNumber);
    alert('Quotation duplicated successfully! Redirecting to edit...');
    this.router.navigate(['/quotations/create']);
  }

  goBack(): void {
    this.router.navigate(['/quotations']);
  }

  printQuotation(): void {
    window.print();
  }
}