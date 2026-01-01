// src/app/sales-create-quotation/sales-create-quotations.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { QuotationService, CreateQuotationPayload } from '../services/quotation.service';
import { LeadsService, Lead as LeadFromApi } from '../lead.service';

declare var Toastify: any;

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  address: string;
}

interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  unit: string;
}

interface QuotationItem {
  product: Product | null;
  quantity: number;
  price: number;
  discount: number;
  tax: number;
  total: number;
}

@Component({
  selector: 'app-sales-create-quotation',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-create-quotations.component.html',
  styleUrls: ['./sales-create-quotations.component.css']
})
export class SalesCreateQuotationComponent implements OnInit {
  selectedLeadId: string = '';
  leads: Lead[] = [];
  loadingLeads: boolean = false;
  
  leadSearchTerm: string = '';
  filteredLeads: Lead[] = [];
  showLeadDropdown: boolean = false;

  customerName: string = '';
  customerEmail: string = '';
  customerPhone: string = '';
  customerAddress: string = '';
  customerCompany: string = '';

  quoteNumber: string = '';
  quoteDate: string = '';
  validUntil: string = '';
  
  today: string = new Date().toISOString().split('T')[0];
  defaultValidUntil: string = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  availableProducts: Product[] = [
    { id: '1', name: '8-Floor Passenger Elevator', category: 'Passenger', price: 1500000, unit: 'Unit' },
    { id: '2', name: '5-Floor Home Lift', category: 'Home', price: 750000, unit: 'Unit' },
    { id: '3', name: '12-Floor Goods Elevator', category: 'Goods', price: 2200000, unit: 'Unit' },
    { id: '4', name: '6-Floor Hospital Elevator', category: 'Hospital', price: 1800000, unit: 'Unit' },
    { id: '5', name: 'Installation Service', category: 'Service', price: 150000, unit: 'Service' },
    { id: '6', name: 'Annual Maintenance Contract', category: 'Service', price: 50000, unit: 'Year' },
    { id: '7', name: 'Emergency Repair', category: 'Service', price: 25000, unit: 'Service' }
  ];

  quotationItems: QuotationItem[] = [
    {
      product: null,
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 18,
      total: 0
    }
  ];

  termsAndConditions: string = `1. Payment Terms: 50% advance, 30% on installation, 20% on completion
2. Delivery Time: 60-90 days from order confirmation
3. Warranty: 12 months comprehensive warranty
4. Installation charges included
5. Annual maintenance contract optional`;

  notes: string = '';
  loading: boolean = false;

  constructor(
    private router: Router,
    private quotationService: QuotationService,
    private leadsService: LeadsService
  ) {}

  ngOnInit(): void {
    this.generateQuoteNumber();
    this.quoteDate = this.today;
    this.validUntil = this.defaultValidUntil;
    this.loadLeadsFromAPI();
  }

  loadLeadsFromAPI(): void {
    this.loadingLeads = true;
    
    this.leadsService.getAllLeads().subscribe({
      next: (apiLeads: LeadFromApi[]) => {
        const assignedLeads = apiLeads.filter(lead => 
          lead.assignedTo && lead.assignedTo.trim() !== ''
        );
        
        this.leads = assignedLeads.map(apiLead => ({
          id: apiLead._id,
          name: apiLead.fullName,
          email: apiLead.email,
          phone: apiLead.phoneNumber,
          company: apiLead.companyName || '',
          address: this.extractAddressFromNotes(apiLead.notes || '')
        }));
        
        this.filteredLeads = [...this.leads];
        this.loadingLeads = false;
      },
      error: (error) => {
        console.error('Error loading leads:', error);
        this.showToast('Failed to load leads. Please try again.', 'error');
        this.loadingLeads = false;
      }
    });
  }

  onLeadSearch(): void {
    const searchTerm = this.leadSearchTerm.toLowerCase().trim();
    
    if (!searchTerm) {
      this.filteredLeads = [...this.leads];
      this.showLeadDropdown = false;
      return;
    }
    
    this.filteredLeads = this.leads.filter(lead => 
      lead.name.toLowerCase().includes(searchTerm) ||
      lead.company.toLowerCase().includes(searchTerm) ||
      lead.phone.includes(searchTerm) ||
      lead.email.toLowerCase().includes(searchTerm)
    );
    
    this.showLeadDropdown = this.filteredLeads.length > 0;
  }

  selectLead(lead: Lead): void {
    this.selectedLeadId = lead.id;
    this.leadSearchTerm = lead.name;
    this.showLeadDropdown = false;
    
    this.customerName = lead.name;
    this.customerEmail = lead.email;
    this.customerPhone = lead.phone;
    this.customerAddress = lead.address;
    this.customerCompany = lead.company;
  }

  clearLeadSearch(): void {
    this.leadSearchTerm = '';
    this.selectedLeadId = '';
    this.filteredLeads = [...this.leads];
    this.showLeadDropdown = false;
    
    this.customerName = '';
    this.customerEmail = '';
    this.customerPhone = '';
    this.customerAddress = '';
    this.customerCompany = '';
  }

  onLeadSearchFocus(): void {
    if (this.filteredLeads.length > 0) {
      this.showLeadDropdown = true;
    }
  }

  onLeadSearchBlur(): void {
    setTimeout(() => {
      this.showLeadDropdown = false;
    }, 200);
  }

  extractAddressFromNotes(notes: string): string {
    if (!notes) return '';
    
    const parts = notes.split(' | ');
    let fullAddress = '';
    
    parts.forEach(part => {
      const [key, ...valueParts] = part.split(': ');
      if (key && valueParts.length > 0) {
        const value = valueParts.join(': ').trim();
        const cleanKey = key.trim();
        
        if (cleanKey === 'Address') {
          fullAddress += value;
        } else if (cleanKey === 'City') {
          fullAddress += fullAddress ? ', ' + value : value;
        } else if (cleanKey === 'State') {
          fullAddress += fullAddress ? ', ' + value : value;
        } else if (cleanKey === 'Pincode') {
          fullAddress += fullAddress ? ' - ' + value : value;
        }
      }
    });
    
    return fullAddress;
  }

  generateQuoteNumber(): void {
    const timestamp = Date.now();
    this.quoteNumber = `QT-${new Date().getFullYear()}-${timestamp.toString().slice(-6)}`;
  }

  onLeadSelected(): void {
    if (!this.selectedLeadId) {
      this.customerName = '';
      this.customerEmail = '';
      this.customerPhone = '';
      this.customerAddress = '';
      this.customerCompany = '';
      return;
    }

    const selectedLead = this.leads.find(lead => lead.id === this.selectedLeadId);
    
    if (selectedLead) {
      this.customerName = selectedLead.name;
      this.customerEmail = selectedLead.email;
      this.customerPhone = selectedLead.phone;
      this.customerAddress = selectedLead.address;
      this.customerCompany = selectedLead.company;
    }
  }

  addItem(): void {
    this.quotationItems.push({
      product: null,
      quantity: 1,
      price: 0,
      discount: 0,
      tax: 18,
      total: 0
    });
  }

  removeItem(index: number): void {
    if (this.quotationItems.length > 1) {
      this.quotationItems.splice(index, 1);
    }
  }

  onProductChange(index: number): void {
    const item = this.quotationItems[index];
    if (item.product) {
      item.price = item.product.price;
      this.calculateItemTotal(index);
    }
  }

  calculateItemTotal(index: number): void {
    const item = this.quotationItems[index];
    const subtotal = item.quantity * item.price;
    const discountAmount = subtotal * (item.discount / 100);
    const taxableAmount = subtotal - discountAmount;
    const taxAmount = taxableAmount * (item.tax / 100);
    item.total = taxableAmount + taxAmount;
  }

  get subtotal(): number {
    return this.quotationItems.reduce((sum, item) => {
      return sum + (item.quantity * item.price);
    }, 0);
  }

  get totalDiscount(): number {
    return this.quotationItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      return sum + (itemSubtotal * (item.discount / 100));
    }, 0);
  }

  get totalTax(): number {
    return this.quotationItems.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.price;
      const discountAmount = itemSubtotal * (item.discount / 100);
      const taxableAmount = itemSubtotal - discountAmount;
      return sum + (taxableAmount * (item.tax / 100));
    }, 0);
  }

  get grandTotal(): number {
    return this.quotationItems.reduce((sum, item) => sum + item.total, 0);
  }

  formatCurrency(amount: number): string {
    return `₹${amount.toLocaleString('en-IN')}`;
  }

  validateForm(): boolean {
    if (!this.customerName.trim()) {
      this.showToast('Please enter customer name', 'error');
      return false;
    }
    if (!this.customerEmail.trim()) {
      this.showToast('Please enter customer email', 'error');
      return false;
    }
    if (!this.customerPhone.trim()) {
      this.showToast('Please enter customer phone', 'error');
      return false;
    }
    if (!this.quoteDate) {
      this.showToast('Please select quote date', 'error');
      return false;
    }
    if (!this.validUntil) {
      this.showToast('Please select valid until date', 'error');
      return false;
    }
    
    const quoteDateObj = new Date(this.quoteDate);
    const validUntilObj = new Date(this.validUntil);
    
    if (validUntilObj <= quoteDateObj) {
      this.showToast('Valid Until date must be after Quote Date', 'error');
      return false;
    }
    
    const hasValidItems = this.quotationItems.some(item => item.product !== null);
    if (!hasValidItems) {
      this.showToast('Please add at least one product', 'error');
      return false;
    }

    return true;
  }

  preview(): void {
    if (this.validateForm()) {
      const quotationData = this.getQuotationData();
      localStorage.setItem('quotationPreview', JSON.stringify(quotationData));
      this.router.navigate(['/quotations/preview']);
    }
  }

  saveAsDraft(): void {
    if (!this.validateForm()) return;

    this.loading = true;
    const formData = this.getFormData();
    const payload = this.quotationService.formatQuotationForBackend(formData);
    payload.status = 'draft';

    this.quotationService.createQuotation(payload).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.statusCode === 201) {
          this.showToast('Quotation saved as draft successfully!', 'success');
          this.router.navigate(['/quotations']);
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('Error saving draft:', error);
        this.showToast('Failed to save draft. Please try again.', 'error');
      }
    });
  }

  sendToClient(): void {
    if (!this.validateForm()) return;

    if (typeof Toastify !== 'undefined') {
      const toastHtml = `
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: 8px;">Send Quotation?</div>
          <div style="font-size: 13px; opacity: 0.9;">Send quotation to ${this.customerEmail}</div>
        </div>
      `;

      const toast = Toastify({
        text: toastHtml,
        duration: -1,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        escapeMarkup: false,
        style: {
          background: "#60a5fa",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
          textAlign: "center",
          maxWidth: "400px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        },
        onClick: function() {}
      }).showToast();

      setTimeout(() => {
        const toastElement = document.querySelector('.toastify') as HTMLElement;
        if (toastElement) {
          const buttonsHTML = `
            <div style="margin-top: 16px; display: flex; gap: 10px; justify-content: center;">
              <button id="toast-confirm-btn" style="padding: 8px 20px; background: white; color: #60a5fa; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">
                Send
              </button>
              <button id="toast-cancel-btn" style="padding: 8px 20px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">
                Cancel
              </button>
            </div>
          `;
          toastElement.insertAdjacentHTML('beforeend', buttonsHTML);

          document.getElementById('toast-confirm-btn')?.addEventListener('click', () => {
            toast.hideToast();
            this.proceedSendToClient();
          });

          document.getElementById('toast-cancel-btn')?.addEventListener('click', () => {
            toast.hideToast();
          });
        }
      }, 100);
    } else {
      if (confirm(`Send quotation to ${this.customerEmail}?`)) {
        this.proceedSendToClient();
      }
    }
  }

  private async proceedSendToClient(): Promise<void> {
    this.loading = true;
    const formData = this.getFormData();
    const payload = this.quotationService.formatQuotationForBackend(formData);
    payload.status = 'sent';

    console.log('📤 Creating quotation with status "sent"...');

    this.quotationService.createQuotation(payload).subscribe({
      next: async (response) => {
        if (response.statusCode === 201) {
          const quotationId = (response.data as any)._id || (response.data as any).id;
          
          console.log('✅ Quotation created successfully, ID:', quotationId);
          console.log('📧 Preparing to send email...');
          
          // Build complete quotation data for PDF generation
          const quotationData = this.buildCompleteQuotationData();
          
          console.log('📦 Quotation data prepared:', {
            quoteNumber: quotationData.quoteNumber,
            customerEmail: this.customerEmail,
            itemsCount: quotationData.items.length,
            grandTotal: quotationData.grandTotal
          });
          
          // Send email with PDF
          this.quotationService.sendQuotationWithPDF(quotationId, this.customerEmail, quotationData).subscribe({
            next: (emailResponse) => {
              this.loading = false;
              console.log('✅ Email sent successfully!', emailResponse);
              this.showToast(`Quotation sent to ${this.customerEmail} successfully!`, 'success');
              setTimeout(() => {
                this.router.navigate(['/quotations']);
              }, 1500);
            },
            error: (error) => {
              this.loading = false;
              console.error('❌ Error sending email:', error);
              const errorMessage = error?.error?.message || error?.message || 'Unknown error';
              this.showToast(`Failed to send email: ${errorMessage}`, 'error');
            }
          });
        }
      },
      error: (error) => {
        this.loading = false;
        console.error('❌ Error creating quotation:', error);
        this.showToast('Failed to create quotation. Please try again.', 'error');
      }
    });
  }

  private buildCompleteQuotationData(): any {
    return {
      quoteNumber: this.quoteNumber,
      quoteDate: this.quoteDate,
      validUntil: this.validUntil,
      customer: {
        name: this.customerName,
        email: this.customerEmail,
        phone: this.customerPhone,
        address: this.customerAddress,
        company: this.customerCompany
      },
      items: this.quotationItems
        .filter(item => item.product !== null)
        .map(item => ({
          product: {
            name: item.product!.name,
            category: item.product!.category
          },
          quantity: item.quantity,
          price: item.price,
          discount: item.discount,
          tax: item.tax,
          total: item.total
        })),
      subtotal: this.subtotal,
      totalDiscount: this.totalDiscount,
      totalTax: this.totalTax,
      grandTotal: this.grandTotal,
      termsAndConditions: this.termsAndConditions,
      notes: this.notes
    };
  }

  navigateToQuotations(): void {
    this.router.navigate(['/quotations']);
  }

  cancel(): void {
    if (typeof Toastify !== 'undefined') {
      const toastHtml = `
        <div style="text-align: center;">
          <div style="font-weight: 600; margin-bottom: 8px;">Cancel Quotation?</div>
          <div style="font-size: 13px; opacity: 0.9;">All unsaved changes will be lost</div>
        </div>
      `;

      const toast = Toastify({
        text: toastHtml,
        duration: -1,
        close: true,
        gravity: "top",
        position: "center",
        stopOnFocus: true,
        escapeMarkup: false,
        style: {
          background: "#ef4444",
          borderRadius: "8px",
          fontSize: "14px",
          fontWeight: "500",
          textAlign: "center",
          maxWidth: "400px",
          padding: "20px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        },
        onClick: function() {}
      }).showToast();

      setTimeout(() => {
        const toastElement = document.querySelector('.toastify') as HTMLElement;
        if (toastElement) {
          const buttonsHTML = `
            <div style="margin-top: 16px; display: flex; gap: 10px; justify-content: center;">
              <button id="toast-confirm-cancel" style="padding: 8px 20px; background: white; color: #ef4444; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">
                Yes, Cancel
              </button>
              <button id="toast-keep-editing" style="padding: 8px 20px; background: rgba(255,255,255,0.2); color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600; font-size: 13px;">
                Keep Editing
              </button>
            </div>
          `;
          toastElement.insertAdjacentHTML('beforeend', buttonsHTML);

          document.getElementById('toast-confirm-cancel')?.addEventListener('click', () => {
            toast.hideToast();
            this.router.navigate(['/quotations']);
          });

          document.getElementById('toast-keep-editing')?.addEventListener('click', () => {
            toast.hideToast();
          });
        }
      }, 100);
    } else {
      if (confirm('Are you sure you want to cancel? All unsaved changes will be lost.')) {
        this.router.navigate(['/quotations']);
      }
    }
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

  getFormData(): any {
    return {
      customerName: this.customerName,
      customerEmail: this.customerEmail,
      customerPhone: this.customerPhone,
      customerAddress: this.customerAddress,
      customerCompany: this.customerCompany,
      quoteDate: this.quoteDate,
      validUntil: this.validUntil,
      items: this.quotationItems.filter(item => item.product !== null),
      termsAndConditions: this.termsAndConditions,
      notes: this.notes
    };
  }

  getQuotationData(): any {
    return this.buildCompleteQuotationData();
  }

  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    if (typeof Toastify !== 'undefined') {
      let backgroundColor = '#60a5fa';
      
      if (type === 'success') {
        backgroundColor = '#22c55e';
      } else if (type === 'error') {
        backgroundColor = '#ef4444';
      }

      Toastify({
        text: message,
        duration: 4000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
          background: backgroundColor,
          borderRadius: "8px",
          padding: "12px 20px",
          fontSize: "14px",
          fontWeight: "500",
          boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
        }
      }).showToast();
    } else {
      alert(message);
    }
  }
}