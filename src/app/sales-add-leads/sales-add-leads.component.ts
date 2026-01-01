import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { LeadsService, CreateLead } from '../lead.service';
import { AuthService } from '../services/auth.service';

declare var Toastify: any;  // Added for Toastify

interface LeadDraft {
  basicInfo: {
    name: string;
    company: string;
    designation: string;
    source: string;
    priority: string;
  };
  contactDetails: {
    email: string;
    phone: string;
    alternatePhone: string;
    address: string;
    city: string;
    state: string;
    pincode: string;
  };
  requirements: {
    productInterest: string;
    budget: string;
    timeline: string;
    quantity: string;
  };
}

@Component({
  selector: 'app-sales-add-leads',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sales-add-leads.component.html',
  styleUrls: ['./sales-add-leads.component.css']
})
export class SalesAddLeadComponent implements OnInit {
  currentStep: number = 1;
  totalSteps: number = 3;
  isEditMode: boolean = false;
  leadId: string | null = null;
  isSaving: boolean = false;
  lastSaved: Date | null = null;
  
  leadDraft: LeadDraft = {
    basicInfo: {
      name: '',
      company: '',
      designation: '',
      source: '',
      priority: 'medium'
    },
    contactDetails: {
      email: '',
      phone: '',
      alternatePhone: '',
      address: '',
      city: '',
      state: '',
      pincode: ''
    },
    requirements: {
      productInterest: '',
      budget: '',
      timeline: '',
      quantity: ''
    }
  };

  errors: any = {
    basicInfo: {},
    contactDetails: {},
    requirements: {}
  };

  sourceOptions = ['Website', 'Walk-in', 'Reference', 'Phone Call', 'Email', 'Social Media', 'Other'];
  priorityOptions = [
    { value: 'low', label: 'Low Priority' },
    { value: 'medium', label: 'Medium Priority' },
    { value: 'high', label: 'High Priority' }
  ];
  stateOptions = ['Kerala', 'Tamil Nadu', 'Karnataka', 'Maharashtra', 'Delhi', 'Gujarat', 'Other'];
  timelineOptions = ['Immediate', 'Within 1 Month', '1-3 Months', '3-6 Months', '6+ Months'];

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private leadsService: LeadsService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.leadId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.leadId;

    if (this.isEditMode) {
      this.loadLeadData(this.leadId!);
    } else {
      this.loadDraft();
    }

    setInterval(() => {
      this.autoSaveDraft();
    }, 30000);
  }

  loadLeadData(id: string): void {
    console.log('Loading lead data for ID:', id);
    this.leadsService.getLeadById(id).subscribe({
      next: (lead) => {
        this.leadDraft = {
          basicInfo: {
            name: lead.fullName,
            company: lead.companyName || '',
            designation: '',
            source: lead.leadSource,
            priority: 'medium'
          },
          contactDetails: {
            email: lead.email,
            phone: lead.phoneNumber,
            alternatePhone: '',
            address: '',
            city: '',
            state: '',
            pincode: ''
          },
          requirements: {
            productInterest: '',
            budget: '',
            timeline: '',
            quantity: ''
          }
        };
      },
      error: (error) => {
        console.error('Error loading lead:', error);
        this.showToast('Failed to load lead data', 'error');
        this.router.navigate(['/leads']);
      }
    });
  }

  loadDraft(): void {
    const draft = localStorage.getItem('lead_draft');
    if (draft) {
      try {
        this.leadDraft = JSON.parse(draft);
        const savedTime = localStorage.getItem('lead_draft_time');
        if (savedTime) {
          this.lastSaved = new Date(savedTime);
        }
      } catch (error) {
        console.error('Error loading draft:', error);
        localStorage.removeItem('lead_draft');
        localStorage.removeItem('lead_draft_time');
      }
    }
  }

  autoSaveDraft(): void {
    if (!this.isEditMode && this.hasAnyData()) {
      localStorage.setItem('lead_draft', JSON.stringify(this.leadDraft));
      localStorage.setItem('lead_draft_time', new Date().toISOString());
      this.lastSaved = new Date();
      console.log('Draft auto-saved');
    }
  }

  hasAnyData(): boolean {
    return this.leadDraft.basicInfo.name !== '' || 
           this.leadDraft.basicInfo.company !== '' ||
           this.leadDraft.contactDetails.email !== '' ||
           this.leadDraft.contactDetails.phone !== '';
  }

  nextStep(): void {
    if (this.validateCurrentStep()) {
      if (this.currentStep < this.totalSteps) {
        this.currentStep++;
        this.autoSaveDraft();
      }
    }
  }

  prevStep(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    if (step <= this.currentStep || this.validateSteps(step - 1)) {
      this.currentStep = step;
    }
  }

  validateCurrentStep(): boolean {
    this.errors = { basicInfo: {}, contactDetails: {}, requirements: {} };
    
    switch (this.currentStep) {
      case 1:
        return this.validateBasicInfo();
      case 2:
        return this.validateContactDetails();
      case 3:
        return this.validateRequirements();
      default:
        return true;
    }
  }

  validateSteps(upToStep: number): boolean {
    for (let i = 1; i <= upToStep; i++) {
      const currentStepBackup = this.currentStep;
      this.currentStep = i;
      if (!this.validateCurrentStep()) {
        this.currentStep = currentStepBackup;
        return false;
      }
      this.currentStep = currentStepBackup;
    }
    return true;
  }

  validateBasicInfo(): boolean {
    let isValid = true;

    if (!this.leadDraft.basicInfo.name.trim()) {
      this.errors.basicInfo.name = 'Name is required';
      isValid = false;
    }

    if (!this.leadDraft.basicInfo.company.trim()) {
      this.errors.basicInfo.company = 'Company name is required';
      isValid = false;
    }

    if (!this.leadDraft.basicInfo.source) {
      this.errors.basicInfo.source = 'Lead source is required';
      isValid = false;
    }

    return isValid;
  }

  validateContactDetails(): boolean {
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.leadDraft.contactDetails.email.trim()) {
      this.errors.contactDetails.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(this.leadDraft.contactDetails.email)) {
      this.errors.contactDetails.email = 'Invalid email format';
      isValid = false;
    }

    const phoneRegex = /^[+]?[\d\s-]{10,}$/;
    if (!this.leadDraft.contactDetails.phone.trim()) {
      this.errors.contactDetails.phone = 'Phone number is required';
      isValid = false;
    } else if (!phoneRegex.test(this.leadDraft.contactDetails.phone)) {
      this.errors.contactDetails.phone = 'Invalid phone number';
      isValid = false;
    }

    return isValid;
  }

  validateRequirements(): boolean {
    let isValid = true;

    if (!this.leadDraft.requirements.productInterest.trim()) {
      this.errors.requirements.productInterest = 'Product interest is required';
      isValid = false;
    }

    if (!this.leadDraft.requirements.timeline) {
      this.errors.requirements.timeline = 'Timeline is required';
      isValid = false;
    }

    return isValid;
  }

  saveLead(): void {
    if (!this.validateCurrentStep()) {
      this.showToast('Please fill in all required fields', 'error');
      return;
    }

    this.isSaving = true;
    
    const currentUser = this.authService.currentUserValue;
    console.log('Current User:', currentUser);
    
    const userId = currentUser?.userId || '';
    
    if (!userId) {
      console.error('No userId found in currentUser');
      this.showToast('User identification failed. Please log in again.', 'error');
      this.isSaving = false;
      return;
    }
    
    console.log('Creating lead with userId:', userId);
    
    const rawSource = (this.leadDraft.basicInfo.source || 'Website').toString();
    const allowedSources: Array<'Walk-in' | 'Website' | 'Reference' | 'Phone Call' | 'Email' | 'Social Media' | 'Other'> = 
      ['Walk-in', 'Website', 'Reference', 'Phone Call', 'Email', 'Social Media', 'Other'];
    const normalizedSource = allowedSources.includes(rawSource as any) ? rawSource : 'Other';

    const notesArray = [];
    if (this.leadDraft.basicInfo.designation) {
      notesArray.push(`Designation: ${this.leadDraft.basicInfo.designation}`);
    }
    if (this.leadDraft.basicInfo.priority) {
      notesArray.push(`Priority: ${this.leadDraft.basicInfo.priority}`);
    }
    if (this.leadDraft.contactDetails.alternatePhone) {
      notesArray.push(`Alt Phone: ${this.leadDraft.contactDetails.alternatePhone}`);
    }
    if (this.leadDraft.contactDetails.address) {
      notesArray.push(`Address: ${this.leadDraft.contactDetails.address}`);
    }
    if (this.leadDraft.contactDetails.city) {
      notesArray.push(`City: ${this.leadDraft.contactDetails.city}`);
    }
    if (this.leadDraft.contactDetails.state) {
      notesArray.push(`State: ${this.leadDraft.contactDetails.state}`);
    }
    if (this.leadDraft.contactDetails.pincode) {
      notesArray.push(`Pincode: ${this.leadDraft.contactDetails.pincode}`);
    }
    if (this.leadDraft.requirements.productInterest) {
      notesArray.push(`Product Interest: ${this.leadDraft.requirements.productInterest}`);
    }
    if (this.leadDraft.requirements.budget) {
      notesArray.push(`Budget: ₹${this.leadDraft.requirements.budget}`);
    }
    if (this.leadDraft.requirements.timeline) {
      notesArray.push(`Timeline: ${this.leadDraft.requirements.timeline}`);
    }
    if (this.leadDraft.requirements.quantity) {
      notesArray.push(`Quantity: ${this.leadDraft.requirements.quantity}`);
    }

    const payload: CreateLead = {
      fullName: this.leadDraft.basicInfo.name.trim(),
      email: this.leadDraft.contactDetails.email.trim().toLowerCase(),
      phoneNumber: this.leadDraft.contactDetails.phone.trim(),
      companyName: this.leadDraft.basicInfo.company.trim(),
      leadSource: normalizedSource as CreateLead['leadSource'],
      assignedTo: '',
      createdBy: userId,
      notes: notesArray.join(' | ')
    };

    console.log('Creating lead with payload:', payload);

    this.leadsService.createLead(payload).subscribe({
      next: (created) => {
        console.log('Lead created successfully:', created);
        
        localStorage.removeItem('lead_draft');
        localStorage.removeItem('lead_draft_time');

        this.isSaving = false;
        
        this.leadsService.leadsUpdated.next();
        
        this.showToast('Lead created successfully!', 'success');
        
        this.router.navigate(['/leads']);
      },
      error: (err) => {
        console.error('Error creating lead:', err);
        this.isSaving = false;
        this.showToast(err?.message || 'Failed to create lead', 'error');
      }
    });
  }

  cancel(): void {
    if (confirm('Are you sure you want to cancel? Any unsaved changes will be lost.')) {
      localStorage.removeItem('lead_draft');
      localStorage.removeItem('lead_draft_time');
      this.router.navigate(['/leads']);
    }
  }

  clearDraft(): void {
    if (confirm('Are you sure you want to clear the draft?')) {
      localStorage.removeItem('lead_draft');
      localStorage.removeItem('lead_draft_time');
      this.lastSaved = null;
      
      this.leadDraft = {
        basicInfo: { name: '', company: '', designation: '', source: '', priority: 'medium' },
        contactDetails: { email: '', phone: '', alternatePhone: '', address: '', city: '', state: '', pincode: '' },
        requirements: { productInterest: '', budget: '', timeline: '', quantity: '' }
      };
      
      this.currentStep = 1;
      this.showToast('Draft cleared', 'info');
    }
  }

  goBack(): void {
    this.router.navigate(['/leads']);
  }

  getStepClass(step: number): string {
    if (step === this.currentStep) return 'active';
    if (step < this.currentStep) return 'completed';
    return '';
  }

  // Toastify notification method (same as login page)
  showToast(message: string, type: 'success' | 'error' | 'info' = 'info') {
    if (typeof Toastify !== 'undefined') {
      const backgroundColor = 
        type === 'success' ? 'linear-gradient(to right, #00b09b, #96c93d)' :
        type === 'error' ? 'linear-gradient(to right, #ff5f6d, #ffc371)' :
        'linear-gradient(to right, #667eea, #764ba2)';

      Toastify({
        text: message,
        duration: 3000,
        close: true,
        gravity: "top",
        position: "right",
        stopOnFocus: true,
        style: {
          background: backgroundColor,
          borderRadius: "10px",
          fontSize: "14px",
          fontWeight: "500"
        }
      }).showToast();
    }
  }
}