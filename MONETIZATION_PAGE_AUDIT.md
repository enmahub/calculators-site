# Monetization Page Audit (Requested vs Existing)

Spot-checked against the current English hub lists in `financial-calculators.html` (manual list + “More Financial Calculators” block) and `career-calculators.html` (manual list + “More Career Calculators” block).

## Already Existing or Close Equivalent

- **Employment / Income** (see **Career** hub generated list unless noted)
  - `overtime-pay-calculator.html`, `commission-calculator.html`, `biweekly-to-annual-salary-calculator.html`, `take-home-paycheck-calculator.html`, `raise-calculator.html`
  - `salary-after-tax-calculator.html` (Salary After Tax Calculator, US)
  - `hourly-to-salary-after-tax-calculator.html`
  - `1099-vs-w2-income-calculator.html`
  - `freelance-tax-estimate-calculator.html`
  - `side-hustle-income-tax-calculator.html`
  - `self-employment-tax-calculator.html`
  - State paycheck pilots: `us/ca/paycheck-calculator.html`, `us/tx/paycheck-calculator.html`, `us/fl/paycheck-calculator.html`, `us/ny/paycheck-calculator.html`, `us/wa/paycheck-calculator.html`
- **Debt / Loans** (see **Financial** hub generated list unless noted)
  - `debt-payoff.html`, `credit-card-interest-calculator.html`, `refinance-calculator.html`
  - `debt-snowball-calculator.html`, `debt-avalanche-calculator.html`, `extra-payment-loan-calculator.html`
- **Housing** (Financial hub generated list)
  - `rent-vs-buy-calculator.html`
  - `mortgage-affordability-calculator.html`, `closing-cost-calculator.html`, `property-tax-estimate-calculator.html`
- **Business / Freelance**
  - `break-even-calculator.html` (close to break-even time)
  - `profit-margin-calculator.html` (close to profit per sale)
  - `self-employment-tax-calculator.html` (listed under Career hub; tax angle for freelancers)
- **Repeat Use**
  - `emergency-fund-calculator.html`, `net-worth-calculator.html`
- **Other Financial hub tools** (generated block; useful cross-sell)
  - `roi-calculator.html`, `debt-to-income-calculator.html`, `401k-calculator.html`, `payback-period-calculator.html`, `apr-calculator.html`
  - Amount-based loan and salary pages (e.g. `*-loan-payment-calculator.html`, `*-salary-to-hourly-calculator.html`) appear in the Financial hub list as generated entries

## Missing from Requested High-Intent List

These intents do **not** have a matching calculator page in the repo (no `*.html` found under the site root / `us/` beyond the hubs above).

- **Debt / Loans**
  - Auto Loan Down Payment Calculator
  - Personal Loan Affordability Calculator
- **Housing**
  - Security Deposit Calculator
  - Roommate Rent Split Calculator
- **Business / Freelance**
  - Invoice Tax Calculator
  - Freelancer Day Rate Calculator
  - Subscription Revenue Calculator

## De-duplication Notes for Backlog

- Use **Commission + Base Salary Calculator** as fulfilled by `commission-calculator.html`.
- Treat **Refinance Savings Calculator** as fulfilled by `refinance-calculator.html` unless a deeper amortization variant is required.
- Keep **Time and a Half** under `overtime-pay-calculator.html` unless separate payroll-rule variants are needed.
- Keep **Biweekly to Monthly Income** covered via `biweekly-to-annual-salary-calculator.html` output unless a standalone intent page is preferred.
