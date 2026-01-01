// src/app/sales-my-quotations/sales-my-quotations.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuotationService, Quotation } from '../services/quotation.service';
import { DealService } from '../services/deal.service';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-sales-my-quotations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-my-quotations.component.html',
  styleUrls: ['./sales-my-quotations.component.css']
})
export class SalesMyQuotationsComponent implements OnInit {
  searchTerm: string = '';
  quotations: Quotation[] = [];
  filteredQuotations: Quotation[] = [];
  paginatedQuotations: Quotation[] = [];
  loading: boolean = false;
  error: string = '';

  // Pagination - 7 items per page
  currentPage: number = 1;
  pageSize: number = 7;
  totalPages: number = 0;

  constructor(
    private router: Router,
    private quotationService: QuotationService,
    private dealService: DealService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loadQuotations();
  }

  loadQuotations(): void {
    this.loading = true;
    this.error = '';
    
    this.quotationService.getAllQuotations().subscribe({
      next: (response) => {
        if (response.statusCode === 200) {
          const data = Array.isArray(response.data) ? response.data : [response.data];
          this.quotations = data.map(q => this.quotationService.formatQuotationForFrontend(q));
          this.applyFiltersAndSort();
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading quotations:', error);
        this.error = 'Failed to load quotations. Please try again.';
        this.loading = false;
      }
    });
  }

  get totalQuotations(): number {
    return this.quotations.length;
  }

  get totalValue(): number {
    return this.quotations.reduce((sum, q) => sum + (q.totalAmount || q.totalCost || 0), 0);
  }

  get averageValue(): number {
    if (this.quotations.length === 0) return 0;
    return this.totalValue / this.quotations.length;
  }

  applyFiltersAndSort(): void {
    this.filteredQuotations = this.quotations.filter(quote => {
      const matchesSearch = !this.searchTerm || 
        (quote.customerName || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (quote.quoteNumber || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (quote.customerEmail || '').toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        (quote.customerCompany || quote.companyName || '').toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesSearch;
    });

    this.filteredQuotations.sort((a, b) => {
      const dateA = a.createdDate || new Date(a.createdAt || 0);
      const dateB = b.createdDate || new Date(b.createdAt || 0);
      return dateB.getTime() - dateA.getTime();
    });

    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredQuotations.length / this.pageSize);
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = this.totalPages;
    } else if (this.totalPages === 0) {
      this.currentPage = 1;
    }

    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.paginatedQuotations = this.filteredQuotations.slice(start, end);
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

  createQuotation(): void {
    this.router.navigate(['/quotations/create']);
  }

  viewQuotation(id: string | undefined): void {
    try {
      if (!id) {
        alert('Invalid quotation ID');
        return;
      }

      const local = this.quotations.find(q => (q.id || q._id) === id || q._id === id || q.id === id);
      if (local) {
        const previewData = this.buildPreviewFromQuotation(local);
        try { localStorage.setItem('quotationPreview', JSON.stringify(previewData)); } catch (e) {}
        this.router.navigate(['/quotations/preview'], { state: { quotationData: previewData } });
        return;
      }

      this.loading = true;
      this.quotationService.getQuotationById(id).subscribe({
        next: (response) => {
          this.loading = false;
          if (response && response.data) {
            const backend = response.data as any;
            const formatted = this.quotationService.formatQuotationForFrontend(backend);
            const previewData = this.buildPreviewFromQuotation(formatted);
            try { localStorage.setItem('quotationPreview', JSON.stringify(previewData)); } catch (e) {}
            this.router.navigate(['/quotations/preview'], { state: { quotationData: previewData } });
          } else {
            alert('Quotation data not found');
          }
        },
        error: (err) => {
          this.loading = false;
          console.error('Error fetching quotation:', err);
          alert('Failed to load quotation. Please try again.');
        }
      });
    } catch (err) {
      console.error('Unexpected error in viewQuotation:', err);
      alert('An unexpected error occurred. Check console for details.');
    }
  }

  private buildPreviewFromQuotation(q: Quotation): any {
    const items = (q.items || []).map(it => ({
      product: { name: it.product?.name || '', category: it.product?.category || '' },
      quantity: it.quantity || 1,
      price: it.price || 0,
      discount: it.discount || 0,
      tax: it.tax || 0,
      total: it.total || ((it.quantity || 1) * (it.price || 0))
    }));

    const subtotal = items.reduce((s: number, it: any) => s + (it.quantity * it.price), 0);
    const totalDiscount = items.reduce((s: number, it: any) => s + ((it.quantity * it.price) * (it.discount / 100)), 0);
    const totalTax = items.reduce((s: number, it: any) => {
      const taxable = (it.quantity * it.price) - ((it.quantity * it.price) * (it.discount / 100));
      return s + (taxable * (it.tax / 100));
    }, 0);
    const grandTotal = q.totalAmount || q.totalCost || (subtotal - totalDiscount + totalTax);

    return {
      quoteNumber: q.quoteNumber || '',
      quoteDate: q.quoteDate || q.createdAt || q.createdDate || '',
      validUntil: q.validUntil || '',
      customer: {
        name: q.customerName || '',
        company: q.customerCompany || q.companyName || '',
        email: q.customerEmail || '',
        phone: q.customerPhone || '',
        address: ''
      },
      items,
      subtotal,
      totalDiscount,
      totalTax,
      grandTotal,
      termsAndConditions: q.termsAndConditions || q.internalNotes || '',
      notes: q.notes || q.specialRequirements || ''
    };
  }

  deleteQuotation(id: string | undefined): void {
    if (!id) {
      alert('Invalid quotation ID');
      return;
    }

    const quotation = this.quotations.find(q => (q.id || q._id) === id);
    if (confirm(`Are you sure you want to delete quotation ${quotation?.quoteNumber}?`)) {
      const quotationId = quotation?._id || quotation?.id;
      if (!quotationId) {
        alert('Invalid quotation ID');
        return;
      }

      this.quotationService.deleteQuotation(quotationId).subscribe({
        next: (response) => {
          if (response.statusCode === 200) {
            alert('Quotation deleted successfully!');
            this.loadQuotations();
          }
        },
        error: (error) => {
          console.error('Error deleting quotation:', error);
          alert('Failed to delete quotation. Please try again.');
        }
      });
    }
  }

  // CHANGED: No navigation after successful conversion
  convertToDeal(id: string | undefined): void {
    if (!id) {
      alert('Invalid quotation ID');
      return;
    }

    const quotation = this.quotations.find(q => (q.id || q._id) === id);
    if (!quotation) {
      alert('Quotation not found');
      return;
    }

    if (confirm(`Convert quotation ${quotation.quoteNumber} for ${quotation.customerName} to a deal?`)) {
      this.loading = true;

      console.log('Converting quotation to deal:', quotation);

      const quotationData = {
        _id: quotation._id || quotation.id,
        quoteNumber: quotation.quoteNumber || 'N/A',
        customerName: quotation.customerName || 'Unknown',
        customerCompany: quotation.customerCompany || quotation.companyName || 'N/A',
        customerEmail: quotation.customerEmail || 'contact@example.com',
        customerPhone: quotation.customerPhone || '+91 0000000000',
        totalAmount: quotation.totalAmount || quotation.totalCost || 0,
        elevationType: quotation.elevationType || 'Home Lift',
        customerAddress: (quotation as any).customerAddress || '',
        termsAndConditions: quotation.termsAndConditions || quotation.internalNotes || '',
        notes: quotation.notes || '',
        specialRequirements: quotation.specialRequirements || ''
      };

      console.log('Quotation data being sent:', quotationData);

      this.dealService.createDealFromQuotation(quotationData).subscribe({
        next: (deal) => {
          this.loading = false;
          console.log('Deal created successfully:', deal);
          
          alert(`✓ Quotation converted to deal successfully!\n\nDeal Title: ${deal.title || deal.dealTitle || 'New Deal'}\nDeal Amount: ${this.formatCurrency(deal.dealAmount || quotation.totalAmount)}\n\nThe new deal is now available in the Deals section.`);
          
          // Stay on the current page and refresh the list
          this.loadQuotations();
        },
        error: (error) => {
          this.loading = false;
          console.error('Error converting quotation to deal:', error);
          
          let errorMessage = 'Failed to convert quotation to deal.\n\n';
          
          if (error.status === 400) {
            errorMessage += 'Bad Request: ';
            if (error.error && error.error.message) {
              errorMessage += error.error.message;
            } else {
              errorMessage += 'The data sent to the server is invalid.';
            }
          } else if (error.status === 401) {
            errorMessage += 'Authentication Error: Please log in again.';
          } else if (error.status === 500) {
            errorMessage += 'Server Error: Please contact support.';
          } else {
            errorMessage += error.message || 'Unknown error occurred.';
          }
          
          errorMessage += '\n\nPlease check the browser console for more details.';
          alert(errorMessage);
        }
      });
    }
  }

  formatCurrency(amount: number | undefined): string {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₹0';
    }
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  formatDate(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { 
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  }

  getElevatorTypeIcon(type: string): string {
    const icons: { [key: string]: string } = {
      'Home Lift': '🏠',
      'home lift': '🏠',
      'Commercial Elevator': '🏬',
      'commercial elevator': '🏬',
      'Elevator with Shaft': '🔲',
      'elevator with shaft': '🔲',
      'Shaftless Elevator': '⬜',
      'shaftless elevator': '⬜'
    };
    return icons[type] || '🏢';
  }

  getQuotationId(quote: Quotation): string {
    return (quote._id || quote.id || '') as string;
  }
}