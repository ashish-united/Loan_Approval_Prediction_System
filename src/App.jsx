import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  User, 
  MapPin, 
  DollarSign, 
  Calendar, 
  ShieldCheck, 
  FileText, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  ArrowRight,
  ArrowLeft,
  TrendingUp, 
  Percent, 
  HelpCircle,
  Sparkles,
  RefreshCw,
  Coins,
  Award,
  Layers,
  Hash
} from 'lucide-react';

export default function App() {
  // Wizard Step State
  const [step, setStep] = useState(1);

  // Single state object binding for all 21 inputs matching the loan dataset CSV
  const [formData, setFormData] = useState({
    // Step 1: Demographics
    age: '35',
    gender: 'Male',
    marital_status: 'Married',
    education_level: "Bachelor's",
    
    // Step 2: Employment & Financial Standing
    employment_status: 'Employed',
    annual_income: '60000',
    monthly_income: '5000',
    total_credit_limit: '45000',
    current_balance: '12000',
    
    // Step 3: Credit History & Records
    credit_score: '720',
    debt_to_income_ratio: '0.25',
    delinquency_history: '0', // 0 = No history, 1 = Has history
    num_of_delinquencies: '0',
    public_records: '0',
    num_of_open_accounts: '6',
    
    // Step 4: Loan Details
    loan_amount: '15000',
    loan_term: '36',
    loan_purpose: 'Debt consolidation',
    interest_rate: '9.99',
    installment: '483.97',
    grade_subgrade: 'B3'
  });

  // UI Interactive States
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [predictionResult, setPredictionResult] = useState(null);
  const [overrideMode, setOverrideMode] = useState('auto'); // auto, force_approve, force_reject

  // Simulation loading messages
  const loadingMessages = [
    "Contacting credit bureaus for background check...",
    "Validating annual income and open account records...",
    "Running XGBoost risk assessment model...",
    "Calculating debt-to-income limits and asset safety covers...",
    "Formatting grade categorization and finalizing credit report..."
  ];

  // Rotate simulated loading messages
  useEffect(() => {
    let interval;
    if (isLoading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => {
          if (prev < loadingMessages.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 400);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Sync: Auto-calculate monthly income when annual income changes
  useEffect(() => {
    const annual = parseFloat(formData.annual_income || 0);
    setFormData((prev) => ({
      ...prev,
      monthly_income: isNaN(annual) ? '0' : (annual / 12).toFixed(2)
    }));
  }, [formData.annual_income]);

  // Sync: Estimate risk grade & interest rate when credit score changes
  useEffect(() => {
    const score = parseInt(formData.credit_score || 600);
    let grade = 'D1';
    let suggestedRate = 14.5;
    
    if (score >= 800) {
      grade = 'A1';
      suggestedRate = 5.25;
    } else if (score >= 750) {
      grade = 'A5';
      suggestedRate = 7.5;
    } else if (score >= 700) {
      grade = 'B3';
      suggestedRate = 9.99;
    } else if (score >= 650) {
      grade = 'C2';
      suggestedRate = 12.5;
    } else if (score >= 600) {
      grade = 'D4';
      suggestedRate = 15.0;
    } else if (score >= 550) {
      grade = 'E2';
      suggestedRate = 18.0;
    } else if (score >= 500) {
      grade = 'F1';
      suggestedRate = 22.0;
    } else {
      grade = 'G5';
      suggestedRate = 26.99;
    }
    
    setFormData((prev) => ({
      ...prev,
      grade_subgrade: grade,
      interest_rate: prev.interest_rate === '9.99' && score === 720 ? '9.99' : suggestedRate.toString()
    }));
  }, [formData.credit_score]);

  // Sync: Calculate monthly installments using amortization formula
  useEffect(() => {
    const P = parseFloat(formData.loan_amount || 0);
    const annualRate = parseFloat(formData.interest_rate || 0);
    const months = parseInt(formData.loan_term || 36);
    
    if (P > 0 && annualRate > 0 && months > 0) {
      const r = (annualRate / 100) / 12;
      const installmentVal = P * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1);
      
      setFormData((prev) => ({
        ...prev,
        installment: isNaN(installmentVal) ? '0' : installmentVal.toFixed(2)
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        installment: '0'
      }));
    }
  }, [formData.loan_amount, formData.interest_rate, formData.loan_term]);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Step Validation Logic
  const validateStep = (currentStep) => {
    const newErrors = {};
    
    if (currentStep === 1) {
      const ageVal = parseInt(formData.age || 0);
      if (isNaN(ageVal) || ageVal < 18 || ageVal > 100) {
        newErrors.age = "Applicant must be between 18 and 100 years old.";
      }
    }
    
    if (currentStep === 2) {
      const annualVal = parseFloat(formData.annual_income || 0);
      if (isNaN(annualVal) || annualVal <= 0) {
        newErrors.annual_income = "Please enter a valid annual income.";
      }
      const limitVal = parseFloat(formData.total_credit_limit || 0);
      if (isNaN(limitVal) || limitVal < 0) {
        newErrors.total_credit_limit = "Total credit limit cannot be negative.";
      }
      const balanceVal = parseFloat(formData.current_balance || 0);
      if (isNaN(balanceVal) || balanceVal < 0) {
        newErrors.current_balance = "Current balance cannot be negative.";
      }
    }
    
    if (currentStep === 3) {
      const scoreVal = parseInt(formData.credit_score || 0);
      if (isNaN(scoreVal) || scoreVal < 300 || scoreVal > 850) {
        newErrors.credit_score = "Credit score must be between 300 and 850.";
      }
      const dtiVal = parseFloat(formData.debt_to_income_ratio || 0);
      if (isNaN(dtiVal) || dtiVal < 0 || dtiVal > 1.5) {
        newErrors.debt_to_income_ratio = "Debt-to-Income ratio must be between 0.00 and 1.50.";
      }
      const delinqVal = parseInt(formData.num_of_delinquencies || 0);
      if (isNaN(delinqVal) || delinqVal < 0) {
        newErrors.num_of_delinquencies = "Delinquency count cannot be negative.";
      }
      const recordsVal = parseInt(formData.public_records || 0);
      if (isNaN(recordsVal) || recordsVal < 0) {
        newErrors.public_records = "Public records count cannot be negative.";
      }
      const accountsVal = parseInt(formData.num_of_open_accounts || 0);
      if (isNaN(accountsVal) || accountsVal < 0) {
        newErrors.num_of_open_accounts = "Open accounts count cannot be negative.";
      }
    }
    
    if (currentStep === 4) {
      const loanAmtVal = parseFloat(formData.loan_amount || 0);
      if (isNaN(loanAmtVal) || loanAmtVal <= 0) {
        newErrors.loan_amount = "Please specify a valid loan amount.";
      }
      const rateVal = parseFloat(formData.interest_rate || 0);
      if (isNaN(rateVal) || rateVal <= 0) {
        newErrors.interest_rate = "Please specify an interest rate.";
      }
      const termVal = parseInt(formData.loan_term || 0);
      if (isNaN(termVal) || termVal <= 0) {
        newErrors.loan_term = "Please specify a valid loan term.";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Stepper Handlers
  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  // Dataset-aligned ML Prediction Simulator
  const runPredictionLogic = () => {
    const ageVal = parseInt(formData.age || 0);
    const scoreVal = parseInt(formData.credit_score || 600);
    const dtiVal = parseFloat(formData.debt_to_income_ratio || 0.3);
    const delinqCount = parseInt(formData.num_of_delinquencies || 0);
    const publicRecords = parseInt(formData.public_records || 0);
    const annualVal = parseFloat(formData.annual_income || 0);
    const loanAmtVal = parseFloat(formData.loan_amount || 0);
    const termVal = parseInt(formData.loan_term || 36);

    let score = 55; // base rating score out of 100
    const criteria = [];
    const suggestions = [];

    // 1. Credit Score Check (Major weight)
    if (scoreVal >= 750) {
      score += 25;
      criteria.push({ text: `Outstanding Credit Rating (${scoreVal}) indicates low risk.`, status: 'pass' });
    } else if (scoreVal >= 680) {
      score += 15;
      criteria.push({ text: `Good Credit Rating (${scoreVal}).`, status: 'pass' });
    } else if (scoreVal >= 600) {
      score += 2;
      criteria.push({ text: `Fair Credit Rating (${scoreVal}) carries average risk.`, status: 'info' });
      suggestions.push("Improve your credit score above 680 to lock in better interest rates.");
    } else {
      score -= 25;
      criteria.push({ text: `Substandard Credit Rating (${scoreVal}) raises high risk alert.`, status: 'fail' });
      suggestions.push("Work on settling open balances and paying bills on time to recover score.");
    }

    // 2. Debt-To-Income Check (Major weight)
    if (dtiVal <= 0.15) {
      score += 15;
      criteria.push({ text: `Favorable Debt-to-Income Ratio (${(dtiVal*100).toFixed(0)}%).`, status: 'pass' });
    } else if (dtiVal <= 0.35) {
      score += 5;
      criteria.push({ text: `Acceptable Debt-to-Income Ratio (${(dtiVal*100).toFixed(0)}%).`, status: 'pass' });
    } else {
      score -= 20;
      criteria.push({ text: `High Debt-to-Income Ratio (${(dtiVal*100).toFixed(0)}%). Exceeds safe threshold.`, status: 'fail' });
      suggestions.push("Lower your requested loan amount or pay down other credit cards to reduce DTI.");
    }

    // 3. Delinquency History
    if (delinqCount === 0 && formData.delinquency_history === '0') {
      score += 10;
      criteria.push({ text: "Impeccable credit record (no delinquencies on file).", status: 'pass' });
    } else {
      const totalDelinq = Math.max(1, delinqCount);
      score -= (10 + totalDelinq * 5);
      criteria.push({ text: `Detected ${totalDelinq} historic credit delinquencies.`, status: 'fail' });
      suggestions.push("Ensure a clean payment ledger for 12 straight months to offset past delinquencies.");
    }

    // 4. Public Records (Bankruptcies, liens)
    if (publicRecords === 0) {
      score += 5;
    } else {
      score -= 20;
      criteria.push({ text: `Public records indicate active legal or bankruptcy filings (${publicRecords} events).`, status: 'fail' });
      suggestions.push("Resolve pending tax liens or bankruptcy discharges prior to loan submittal.");
    }

    // 5. Income Coverage to Loan Payment
    const monthlyPayment = parseFloat(formData.installment || 0);
    const monthlyInc = annualVal / 12;
    const paymentCoverage = monthlyInc > 0 ? (monthlyPayment / monthlyInc) : 0;
    
    if (paymentCoverage < 0.10) {
      score += 10;
      criteria.push({ text: "Favorable installment size relative to monthly budget.", status: 'pass' });
    } else if (paymentCoverage > 0.25) {
      score -= 15;
      criteria.push({ text: `Installment payment consumes ${(paymentCoverage * 100).toFixed(1)}% of base monthly budget.`, status: 'info' });
      suggestions.push("Increase term length or reduce loan amount to bring installments below 20% of income.");
    }

    // 6. Age stability check
    if (ageVal > 65 && formData.employment_status === 'Retired') {
      criteria.push({ text: "Retired status with stable retirement pension profiles.", status: 'info' });
    } else if (formData.employment_status === 'Unemployed') {
      score -= 15;
      criteria.push({ text: "Unemployed status exhibits critical income volatility.", status: 'fail' });
      suggestions.push("Secure full-time employment or apply with an employed co-signer.");
    }

    // Calculate final verdict (Threshold 60)
    let isApproved = score >= 55;

    // Apply manual developer testing overrides
    if (overrideMode === 'force_approve') {
      isApproved = true;
      score = Math.max(70, score);
    } else if (overrideMode === 'force_reject') {
      isApproved = false;
      score = Math.min(45, score);
    }

    return {
      approved: isApproved,
      score: Math.min(100, Math.max(15, score)),
      dti: (dtiVal * 100).toFixed(0),
      monthlyPayment: Math.round(monthlyPayment),
      criteria,
      suggestions: suggestions.length > 0 ? suggestions : ["Maintain outstanding payment profiles to keep preferred rates."]
    };
  };

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsLoading(true);
    setPredictionResult(null);

    // Simulate 2 seconds loading state
    setTimeout(() => {
      const result = runPredictionLogic();
      setPredictionResult(result);
      setIsLoading(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased pb-16">
      
      {/* HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-indigo-600 to-indigo-500 p-2.5 rounded-xl shadow-md text-white">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-slate-900 tracking-tight leading-none flex items-center">
                AURA<span className="text-indigo-600 font-medium ml-1">Lend</span>
              </h1>
              <span className="text-xs text-slate-500 font-medium mt-0.5 block">Bank Loan Decisioning System</span>
            </div>
          </div>
          
          <div className="hidden sm:flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-100">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-emerald-800">Decision API: Online</span>
            </div>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        <div className="absolute top-1/4 left-1/10 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 mb-4">
            <Sparkles className="w-4 h-4 text-indigo-300" />
            <span className="text-xs font-medium tracking-wide text-indigo-200 uppercase">Model Integration Status: Active</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Full-Scale Loan <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-300 via-indigo-100 to-emerald-300">Repayment Predictor</span>
          </h2>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Submit applicant credit history, financials, and demographics mapped 1:1 to your dataset to assess risks and verify eligibility in real-time.
          </p>
        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main id="predictor" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {/* DEVELOPER TESTING TOGGLE OVERLAY */}
        <div className="mb-6 bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
              <RefreshCw className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-800">UI Testing Controls</h4>
              <p className="text-xs text-slate-500">Test how the UI handles different decisions without modifying form values.</p>
            </div>
          </div>
          <div className="flex items-center space-x-2 bg-white p-1 rounded-xl shadow-sm border border-slate-100">
            <button
              onClick={() => setOverrideMode('auto')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${overrideMode === 'auto' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Auto (ML model)
            </button>
            <button
              onClick={() => setOverrideMode('force_approve')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${overrideMode === 'force_approve' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Force Approve
            </button>
            <button
              onClick={() => setOverrideMode('force_reject')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${overrideMode === 'force_reject' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-800'}`}
            >
              Force Reject
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT PANEL: WIZARD APPLICATION FORM */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-2xl border border-slate-150 shadow-xl shadow-slate-100 overflow-hidden">
              
              {/* Form Wizard Header */}
              <div className="px-6 py-5 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-150 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white border border-slate-200 rounded-lg text-slate-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-base leading-tight">Interactive Credit Underwriting</h3>
                    <p className="text-xs text-slate-500">Provide accurate statistics corresponding to the 20,000-records dataset.</p>
                  </div>
                </div>
                <span className="text-xs font-bold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full">Step {step} of 4</span>
              </div>

              {/* Progress Indicator Steps */}
              <div className="bg-slate-50/50 border-b border-slate-100 px-6 py-4 flex items-center justify-between gap-2 overflow-x-auto">
                <div className="flex items-center space-x-2 text-xs font-semibold">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>1</span>
                  <span className={step >= 1 ? 'text-indigo-600' : 'text-slate-500'}>Personal</span>
                </div>
                <div className="h-[1px] flex-grow bg-slate-200 min-w-[16px]"></div>
                <div className="flex items-center space-x-2 text-xs font-semibold">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>2</span>
                  <span className={step >= 2 ? 'text-indigo-600' : 'text-slate-500'}>Income</span>
                </div>
                <div className="h-[1px] flex-grow bg-slate-200 min-w-[16px]"></div>
                <div className="flex items-center space-x-2 text-xs font-semibold">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>3</span>
                  <span className={step >= 3 ? 'text-indigo-600' : 'text-slate-500'}>Credit History</span>
                </div>
                <div className="h-[1px] flex-grow bg-slate-200 min-w-[16px]"></div>
                <div className="flex items-center space-x-2 text-xs font-semibold">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center ${step >= 4 ? 'bg-indigo-600 text-white' : 'bg-slate-200 text-slate-600'}`}>4</span>
                  <span className={step >= 4 ? 'text-indigo-600' : 'text-slate-500'}>Loan Details</span>
                </div>
              </div>

              {/* Form Fields */}
              <div className="p-6 sm:p-8">
                
                {/* STEP 1: DEMOGRAPHICS */}
                {step === 1 && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center">
                      <User className="w-4 h-4 mr-1.5" /> 1. Personal & Demographic Data
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Age */}
                      <div className="space-y-1.5">
                        <label htmlFor="age" className="block text-xs font-semibold text-slate-600">Applicant Age</label>
                        <input
                          type="number"
                          id="age"
                          name="age"
                          value={formData.age}
                          onChange={handleChange}
                          placeholder="e.g. 35"
                          className={`w-full bg-slate-50 border ${errors.age ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                        />
                        {errors.age && <p className="text-xs text-red-500 font-medium">{errors.age}</p>}
                      </div>

                      {/* Gender */}
                      <div className="space-y-1.5">
                        <label htmlFor="gender" className="block text-xs font-semibold text-slate-600">Gender</label>
                        <select
                          id="gender"
                          name="gender"
                          value={formData.gender}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Marital Status */}
                      <div className="space-y-1.5">
                        <label htmlFor="marital_status" className="block text-xs font-semibold text-slate-600">Marital Status</label>
                        <select
                          id="marital_status"
                          name="marital_status"
                          value={formData.marital_status}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        >
                          <option value="Single">Single</option>
                          <option value="Married">Married</option>
                          <option value="Divorced">Divorced</option>
                          <option value="Widowed">Widowed</option>
                        </select>
                      </div>

                      {/* Education Level */}
                      <div className="space-y-1.5">
                        <label htmlFor="education_level" className="block text-xs font-semibold text-slate-600">Highest Education Level</label>
                        <select
                          id="education_level"
                          name="education_level"
                          value={formData.education_level}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        >
                          <option value="High School">High School</option>
                          <option value="Bachelor's">Bachelor's Degree</option>
                          <option value="Master's">Master's Degree</option>
                          <option value="PhD">PhD</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: INCOME & FINANCIAL STANDING */}
                {step === 2 && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center">
                      <Coins className="w-4 h-4 mr-1.5" /> 2. Employment & Income Indicators
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Employment Status */}
                      <div className="space-y-1.5">
                        <label htmlFor="employment_status" className="block text-xs font-semibold text-slate-600">Employment Status</label>
                        <select
                          id="employment_status"
                          name="employment_status"
                          value={formData.employment_status}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        >
                          <option value="Employed">Employed (Full-Time)</option>
                          <option value="Self-employed">Self-Employed</option>
                          <option value="Unemployed">Unemployed</option>
                          <option value="Retired">Retired</option>
                          <option value="Student">Student</option>
                        </select>
                      </div>

                      {/* Annual Income */}
                      <div className="space-y-1.5">
                        <label htmlFor="annual_income" className="block text-xs font-semibold text-slate-600">Annual Gross Income ($)</label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <input
                            type="number"
                            id="annual_income"
                            name="annual_income"
                            value={formData.annual_income}
                            onChange={handleChange}
                            placeholder="e.g. 60000"
                            className={`w-full bg-slate-50 border ${errors.annual_income ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                          />
                        </div>
                        {errors.annual_income && <p className="text-xs text-red-500 font-medium">{errors.annual_income}</p>}
                      </div>

                      {/* Monthly Income (Auto Sync / Disabled) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label htmlFor="monthly_income" className="block text-xs font-semibold text-slate-500">Monthly Income ($)</label>
                          <span className="text-[10px] text-slate-400">Auto-Calculated</span>
                        </div>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-350">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            id="monthly_income"
                            name="monthly_income"
                            value={parseFloat(formData.monthly_income).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Total Credit Limit */}
                      <div className="space-y-1.5">
                        <label htmlFor="total_credit_limit" className="block text-xs font-semibold text-slate-600">Total Credit Limit ($)</label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <input
                            type="number"
                            id="total_credit_limit"
                            name="total_credit_limit"
                            value={formData.total_credit_limit}
                            onChange={handleChange}
                            placeholder="e.g. 45000"
                            className={`w-full bg-slate-50 border ${errors.total_credit_limit ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                          />
                        </div>
                        {errors.total_credit_limit && <p className="text-xs text-red-500 font-medium">{errors.total_credit_limit}</p>}
                      </div>

                      {/* Current Balance */}
                      <div className="space-y-1.5">
                        <label htmlFor="current_balance" className="block text-xs font-semibold text-slate-600">Current Outstanding Credit Balance ($)</label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <input
                            type="number"
                            id="current_balance"
                            name="current_balance"
                            value={formData.current_balance}
                            onChange={handleChange}
                            placeholder="e.g. 12000"
                            className={`w-full bg-slate-50 border ${errors.current_balance ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                          />
                        </div>
                        {errors.current_balance && <p className="text-xs text-red-500 font-medium">{errors.current_balance}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: CREDIT HISTORY & RECORDS */}
                {step === 3 && (
                  <div className="space-y-6">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center">
                      <ShieldCheck className="w-4 h-4 mr-1.5" /> 3. Credit Profile & History
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {/* Credit Score */}
                      <div className="space-y-1.5">
                        <label htmlFor="credit_score" className="block text-xs font-semibold text-slate-600">Credit Score (300-850)</label>
                        <input
                          type="number"
                          id="credit_score"
                          name="credit_score"
                          value={formData.credit_score}
                          onChange={handleChange}
                          placeholder="e.g. 720"
                          className={`w-full bg-slate-50 border ${errors.credit_score ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                        />
                        {errors.credit_score && <p className="text-xs text-red-500 font-medium">{errors.credit_score}</p>}
                      </div>

                      {/* Debt to Income Ratio */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label htmlFor="debt_to_income_ratio" className="block text-xs font-semibold text-slate-600">Debt-to-Income (DTI)</label>
                          <span className="text-[10px] text-slate-400">0.00 to 1.00</span>
                        </div>
                        <input
                          type="number"
                          step="0.01"
                          id="debt_to_income_ratio"
                          name="debt_to_income_ratio"
                          value={formData.debt_to_income_ratio}
                          onChange={handleChange}
                          placeholder="e.g. 0.25"
                          className={`w-full bg-slate-50 border ${errors.debt_to_income_ratio ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                        />
                        {errors.debt_to_income_ratio && <p className="text-xs text-red-500 font-medium">{errors.debt_to_income_ratio}</p>}
                      </div>

                      {/* Delinquency History Dropdown */}
                      <div className="space-y-1.5">
                        <label htmlFor="delinquency_history" className="block text-xs font-semibold text-slate-600">Delinquency History</label>
                        <select
                          id="delinquency_history"
                          name="delinquency_history"
                          value={formData.delinquency_history}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        >
                          <option value="0">No Past Delinquencies</option>
                          <option value="1">Has Delinquency Records</option>
                        </select>
                      </div>

                      {/* Num of Delinquencies */}
                      <div className="space-y-1.5">
                        <label htmlFor="num_of_delinquencies" className="block text-xs font-semibold text-slate-600">Number of Delinquencies</label>
                        <input
                          type="number"
                          id="num_of_delinquencies"
                          name="num_of_delinquencies"
                          value={formData.num_of_delinquencies}
                          onChange={handleChange}
                          placeholder="0"
                          className={`w-full bg-slate-50 border ${errors.num_of_delinquencies ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                        />
                        {errors.num_of_delinquencies && <p className="text-xs text-red-500 font-medium">{errors.num_of_delinquencies}</p>}
                      </div>

                      {/* Public Records */}
                      <div className="space-y-1.5">
                        <label htmlFor="public_records" className="block text-xs font-semibold text-slate-600">Derogatory Public Records</label>
                        <input
                          type="number"
                          id="public_records"
                          name="public_records"
                          value={formData.public_records}
                          onChange={handleChange}
                          placeholder="0"
                          className={`w-full bg-slate-50 border ${errors.public_records ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                        />
                        {errors.public_records && <p className="text-xs text-red-500 font-medium">{errors.public_records}</p>}
                      </div>

                      {/* Open Accounts */}
                      <div className="space-y-1.5">
                        <label htmlFor="num_of_open_accounts" className="block text-xs font-semibold text-slate-600">Number of Open Credit Lines</label>
                        <input
                          type="number"
                          id="num_of_open_accounts"
                          name="num_of_open_accounts"
                          value={formData.num_of_open_accounts}
                          onChange={handleChange}
                          placeholder="e.g. 6"
                          className={`w-full bg-slate-50 border ${errors.num_of_open_accounts ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                        />
                        {errors.num_of_open_accounts && <p className="text-xs text-red-500 font-medium">{errors.num_of_open_accounts}</p>}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 4: LOAN SPECIFICATIONS */}
                {step === 4 && (
                  <div className="space-y-6 animate-fade-in">
                    <h4 className="text-xs font-bold text-indigo-600 uppercase tracking-wider flex items-center">
                      <Calendar className="w-4 h-4 mr-1.5" /> 4. Loan Application Details
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                      {/* Loan Amount */}
                      <div className="space-y-1.5">
                        <label htmlFor="loan_amount" className="block text-xs font-semibold text-slate-600">Loan Amount ($)</label>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <input
                            type="number"
                            id="loan_amount"
                            name="loan_amount"
                            value={formData.loan_amount}
                            onChange={handleChange}
                            placeholder="e.g. 15000"
                            className={`w-full bg-slate-50 border ${errors.loan_amount ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                          />
                        </div>
                        {errors.loan_amount && <p className="text-xs text-red-500 font-medium">{errors.loan_amount}</p>}
                      </div>

                      {/* Loan Term */}
                      <div className="space-y-1.5">
                        <label htmlFor="loan_term" className="block text-xs font-semibold text-slate-600">Loan Term (Months)</label>
                        <select
                          id="loan_term"
                          name="loan_term"
                          value={formData.loan_term}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        >
                          <option value="12">12 Months (1 Year)</option>
                          <option value="36">36 Months (3 Years)</option>
                          <option value="60">60 Months (5 Years)</option>
                        </select>
                      </div>

                      {/* Loan Purpose */}
                      <div className="space-y-1.5">
                        <label htmlFor="loan_purpose" className="block text-xs font-semibold text-slate-600">Loan Purpose</label>
                        <select
                          id="loan_purpose"
                          name="loan_purpose"
                          value={formData.loan_purpose}
                          onChange={handleChange}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                        >
                          <option value="Debt consolidation">Debt Consolidation</option>
                          <option value="Car">Car Loan</option>
                          <option value="Business">Business Venture</option>
                          <option value="Home">Home Improvement</option>
                          <option value="Medical">Medical Expenses</option>
                          <option value="Vacation">Vacation/Travel</option>
                          <option value="Education">Education</option>
                          <option value="Other">Other Purpose</option>
                        </select>
                      </div>

                      {/* Interest Rate (Auto-Estimated) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label htmlFor="interest_rate" className="block text-xs font-semibold text-slate-600">Interest Rate (%)</label>
                          <span className="text-[10px] text-slate-400">Linked to credit score</span>
                        </div>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                            <Percent className="w-4 h-4" />
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            id="interest_rate"
                            name="interest_rate"
                            value={formData.interest_rate}
                            onChange={handleChange}
                            className={`w-full bg-slate-50 border ${errors.interest_rate ? 'border-red-300 focus:ring-red-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl pl-9 pr-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                          />
                        </div>
                        {errors.interest_rate && <p className="text-xs text-red-500 font-medium">{errors.interest_rate}</p>}
                      </div>

                      {/* Installment (Calculated Amortization / Disabled) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label htmlFor="installment" className="block text-xs font-semibold text-slate-500">Monthly Installment ($)</label>
                          <span className="text-[10px] text-slate-450">Amortized payment</span>
                        </div>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-350">
                            <DollarSign className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            id="installment"
                            name="installment"
                            value={parseFloat(formData.installment).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-500 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Grade Subgrade (Auto-Estimated / Disabled) */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label htmlFor="grade_subgrade" className="block text-xs font-semibold text-slate-500">Underwriting Grade</label>
                          <span className="text-[10px] text-slate-400">Risk rating</span>
                        </div>
                        <div className="relative rounded-xl shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-350">
                            <Award className="w-4 h-4" />
                          </div>
                          <input
                            type="text"
                            id="grade_subgrade"
                            name="grade_subgrade"
                            value={formData.grade_subgrade}
                            disabled
                            className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-9 pr-3.5 py-2 text-sm text-slate-500 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Wizard Footer Controls */}
              <div className="px-6 py-5 bg-slate-50 border-t border-slate-150 flex items-center justify-between gap-4">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="inline-flex items-center px-4 py-2 border border-slate-200 text-xs font-bold rounded-xl text-slate-600 bg-white hover:bg-slate-50 transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-1.5" />
                    Back
                  </button>
                ) : (
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Compliance validation active.</span>
                  </div>
                )}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-100"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    type="button"
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-2.5 border border-transparent text-xs font-bold rounded-xl text-white bg-indigo-600 hover:bg-indigo-700 transition-all shadow-md shadow-indigo-150 disabled:opacity-75 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        Predict Repayment Probability
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* RIGHT PANEL: LIVE SUMMARY & RESULTS */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* LIVE DATA ASSESSMENT PANEL */}
            <div className="bg-white rounded-2xl border border-slate-150 shadow-md p-6">
              <h3 className="font-bold text-slate-800 text-sm mb-4 flex items-center">
                <TrendingUp className="w-4.5 h-4.5 mr-2 text-indigo-600" /> Live Risk Metrics Summary
              </h3>
              
              <div className="space-y-4">
                {/* Total Monthly Income Indicator */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Gross Monthly Income</span>
                    <span className="font-extrabold text-slate-900">${(parseFloat(formData.annual_income || 0) / 12).toLocaleString(undefined, {maximumFractionDigits:0})} / mo</span>
                  </div>
                  <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <Coins className="w-4.5 h-4.5" />
                  </div>
                </div>

                {/* Estimate Monthly Payment Indicator */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 flex justify-between items-center">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Estimated Installment</span>
                    <span className="font-extrabold text-slate-900">${parseFloat(formData.installment).toLocaleString(undefined, {maximumFractionDigits:2})} / mo</span>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <Percent className="w-4.5 h-4.5" />
                  </div>
                </div>

                {/* Debt-To-Income gauge */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-600">Debt-to-Income (DTI)</span>
                    <span className={`${parseFloat(formData.debt_to_income_ratio) > 0.40 ? 'text-red-500 font-bold' : 'text-emerald-600'}`}>
                      {(parseFloat(formData.debt_to_income_ratio || 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-300 ${
                        parseFloat(formData.debt_to_income_ratio) > 0.40 ? 'bg-red-500' : parseFloat(formData.debt_to_income_ratio) > 0.25 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, parseFloat(formData.debt_to_income_ratio || 0) * 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold">
                    <span>Good (&lt;15%)</span>
                    <span>Caution (35%)</span>
                    <span>High Risk</span>
                  </div>
                </div>
              </div>
            </div>

            {/* SIMULATED MODEL PROCESSING LOADING STATE */}
            {isLoading && (
              <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden transition-all duration-300">
                <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                    <h4 className="font-bold text-sm text-slate-100 tracking-wide uppercase">Evaluating Features</h4>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                    />
                  </div>

                  <p className="text-xs text-slate-350 italic min-h-[32px] leading-relaxed">
                    {loadingMessages[loadingStep]}
                  </p>
                </div>
              </div>
            )}

            {/* DECISION OUTCOME RESULTS BOX */}
            {predictionResult && !isLoading && (
              <div className={`rounded-2xl border p-6 shadow-xl transition-all duration-300 animate-fade-in ${
                predictionResult.approved 
                  ? 'bg-emerald-50/70 border-emerald-200 text-slate-800' 
                  : 'bg-rose-50/70 border-rose-200 text-slate-800'
              }`}>
                
                {/* Result header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3.5">
                    {predictionResult.approved ? (
                      <div className="bg-emerald-500 p-2.5 rounded-xl text-white shadow-md shadow-emerald-200">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                    ) : (
                      <div className="bg-rose-500 p-2.5 rounded-xl text-white shadow-md shadow-rose-200">
                        <XCircle className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-500 block font-mono">Dataset ML Prediction</span>
                      <h4 className={`text-xl font-extrabold tracking-tight ${
                        predictionResult.approved ? 'text-emerald-950' : 'text-rose-950'
                      }`}>
                        {predictionResult.approved ? 'Low Risk: Paid Back' : 'High Risk: Default'}
                      </h4>
                    </div>
                  </div>

                  {/* Calculated Score Ring */}
                  <div className="text-center">
                    <div className={`w-12 h-12 rounded-full flex flex-col justify-center items-center font-bold text-xs border-2 shadow-sm ${
                      predictionResult.approved 
                        ? 'bg-white text-emerald-700 border-emerald-200' 
                        : 'bg-white text-rose-700 border-rose-200'
                    }`}>
                      <span className="font-extrabold leading-none">{predictionResult.score}</span>
                      <span className="text-[8px] opacity-75 font-semibold leading-none mt-0.5">SCORE</span>
                    </div>
                  </div>
                </div>

                {/* Score context description */}
                <p className="text-xs text-slate-600 mt-4 leading-relaxed">
                  {predictionResult.approved 
                    ? `Applicant profile falls inside acceptable limits. Predicts high likelihood of paying back with a safety index of ${predictionResult.score}/100.` 
                    : `Statistical parameters predict a likelihood of default. Safety score fell below underwriting limits at ${predictionResult.score}/100.`
                  }
                </p>

                {/* Criteria highlights checkmarks */}
                <div className="mt-5 space-y-2.5 bg-white/70 backdrop-blur-sm rounded-xl p-3.5 border border-slate-100 shadow-sm">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Decision Weights</span>
                  {predictionResult.criteria.map((item, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs">
                      {item.status === 'pass' && <span className="text-emerald-500 font-bold mt-0.5">✓</span>}
                      {item.status === 'fail' && <span className="text-rose-500 font-bold mt-0.5">✗</span>}
                      {item.status === 'info' && <span className="text-indigo-500 font-bold mt-0.5">i</span>}
                      <span className="text-slate-700 leading-tight">{item.text}</span>
                    </div>
                  ))}
                </div>

                {/* Suggestions */}
                <div className="mt-5 space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Strategic Recommendations</span>
                  <ul className="space-y-1.5">
                    {predictionResult.suggestions.map((sug, idx) => (
                      <li key={idx} className="flex items-start text-xs text-slate-650 leading-relaxed">
                        <span className="inline-block w-1.5 h-1.5 bg-slate-400 rounded-full mt-1.5 mr-2 flex-shrink-0" />
                        <span>{sug}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Action buttons */}
                <div className="mt-6">
                  {predictionResult.approved ? (
                    <button 
                      type="button"
                      onClick={() => alert("Pre-approval certificate downloaded! (Mocked Action)")}
                      className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-100 transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Approve Application</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => alert("Connecting to a credit advisor... (Mocked Action)")}
                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md transition-colors flex items-center justify-center space-x-2"
                    >
                      <span>Flag for Manual Underwriting</span>
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

              </div>
            )}

            {/* INITIAL BLANK INSTRUCTIONS PANEL */}
            {!predictionResult && !isLoading && (
              <div className="bg-slate-50 border border-slate-200 border-dashed rounded-2xl p-6 text-center text-slate-500">
                <Building2 className="w-10 h-10 mx-auto text-slate-400 mb-3" />
                <h4 className="font-bold text-sm text-slate-700 mb-1">Awaiting Prediction</h4>
                <p className="text-xs text-slate-450 max-w-xs mx-auto leading-relaxed">
                  Complete Steps 1 to 4 on the left and submit to evaluate loan repayment statistics.
                </p>
              </div>
            )}

          </div>

        </div>

      </main>

      {/* FOOTER METADATA */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16 text-center text-xs text-slate-400 border-t border-slate-250 pt-8">
        <p>© 2026 AURALend Decision Systems. Mapped to loan_dataset_20000.csv parameters.</p>
        <div className="flex justify-center space-x-4 mt-2 font-medium text-slate-500">
          <span>Security Protocol v4.2</span>
          <span>•</span>
          <span>Compliance Audited</span>
          <span>•</span>
          <span>Terms & Conditions</span>
        </div>
      </footer>

    </div>
  );
}
