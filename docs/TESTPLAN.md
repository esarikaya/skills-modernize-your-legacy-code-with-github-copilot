# COBOL Student Account Management System - Test Plan

## Overview
This test plan documents all test cases for the COBOL Account Management System. It covers the core business logic for account balance management, including viewing balance, crediting accounts, and debiting accounts with validation rules.

**Target Application**: Account Management System (main.cob, operations.cob, data.cob)
**Test Environment**: COBOL Runtime Environment
**Test Date Range**: June 2026

---

## Test Cases

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status | Comments |
|---|---|---|---|---|---|---|---|
| TC-001 | View Initial Account Balance | Application started; no prior transactions | 1. Select menu option 1 | Display "Current balance: 001000.00" | | | Initial balance should be 1000.00 |
| TC-002 | Credit Account with Valid Amount | Balance is 1000.00 | 1. Select menu option 2<br/>2. Enter credit amount: 500.00 | Display "Amount credited. New balance: 001500.00" | | | Balance increases by 500.00 |
| TC-003 | Credit Account with Small Amount | Balance is 1500.00 | 1. Select menu option 2<br/>2. Enter credit amount: 0.50 | Display "Amount credited. New balance: 001500.50" | | | Handles decimal amounts correctly |
| TC-004 | Credit Account with Large Amount | Balance is 1500.50 | 1. Select menu option 2<br/>2. Enter credit amount: 998499.00 | Display "Amount credited. New balance: 999999.50" | | | Handles maximum account value |
| TC-005 | Credit Account with Zero Amount | Balance is 999999.50 | 1. Select menu option 2<br/>2. Enter credit amount: 0.00 | Display "Amount credited. New balance: 999999.50" | | | Zero credit does not change balance |
| TC-006 | View Balance After Credit | Balance is 999999.50 (after TC-005) | 1. Select menu option 1 | Display "Current balance: 999999.50" | | | Verify balance persists after credit operation |
| TC-007 | Debit Account with Valid Amount (Sufficient Funds) | Balance is 999999.50 | 1. Select menu option 3<br/>2. Enter debit amount: 500.00 | Display "Amount debited. New balance: 999499.50" | | | Balance decreases by 500.00 when funds available |
| TC-008 | Debit Account with Amount Equal to Balance | Balance is 999499.50 | 1. Select menu option 3<br/>2. Enter debit amount: 999499.50 | Display "Amount debited. New balance: 000000.00" | | | Balance becomes zero when debit equals balance |
| TC-009 | Debit Account with Insufficient Funds | Balance is 0.00 | 1. Select menu option 3<br/>2. Enter debit amount: 1.00 | Display "Insufficient funds for this debit." | | | Debit is rejected; balance remains 0.00 |
| TC-010 | Debit Account with Zero Amount | Balance is 0.00 | 1. Select menu option 3<br/>2. Enter debit amount: 0.00 | Display "Amount debited. New balance: 000000.00" | | | Zero debit does not change balance |
| TC-011 | View Balance After Insufficient Funds Attempt | Balance is 0.00 (after TC-009) | 1. Select menu option 1 | Display "Current balance: 000000.00" | | | Balance unchanged after rejected debit |
| TC-012 | Invalid Menu Selection (Non-numeric) | Application at menu prompt | 1. Enter invalid choice: "quit" | Display "Invalid choice, please select 1-4." Return to menu | | | System rejects invalid input gracefully |
| TC-013 | Invalid Menu Selection (Out of Range - Low) | Application at menu prompt | 1. Enter invalid choice: 0 | Display "Invalid choice, please select 1-4." Return to menu | | | System rejects values below range |
| TC-014 | Invalid Menu Selection (Out of Range - High) | Application at menu prompt | 1. Enter invalid choice: 5 | Display "Invalid choice, please select 1-4." Return to menu | | | System rejects values above range |
| TC-015 | Multiple Credit Operations in Sequence | Balance is 0.00 | 1. Select menu option 2; Enter 100.00<br/>2. Select menu option 2; Enter 200.00<br/>3. Select menu option 2; Enter 300.00 | After step 1: "New balance: 000100.00"<br/>After step 2: "New balance: 000300.00"<br/>After step 3: "New balance: 000600.00" | | | System correctly accumulates multiple credits |
| TC-016 | Multiple Debit Operations in Sequence | Balance is 600.00 | 1. Select menu option 3; Enter 100.00<br/>2. Select menu option 3; Enter 150.00<br/>3. Select menu option 3; Enter 200.00 | After step 1: "New balance: 000500.00"<br/>After step 2: "New balance: 000350.00"<br/>After step 3: "New balance: 000150.00" | | | System correctly deducts multiple debits |
| TC-017 | Mixed Credit and Debit Operations | Balance is 150.00 | 1. Select option 2; Enter 350.00 (Credit)<br/>2. Select option 3; Enter 200.00 (Debit)<br/>3. Select option 1 (View) | After credit: "New balance: 000500.00"<br/>After debit: "New balance: 000300.00"<br/>View displays: 000300.00 | | | System correctly handles mixed operations |
| TC-018 | Debit with Amount Exceeding Current Balance | Balance is 300.00 | 1. Select menu option 3<br/>2. Enter debit amount: 500.00 | Display "Insufficient funds for this debit." Balance remains 300.00 | | | System prevents overdraft protection |
| TC-019 | Exit Application | Application at menu | 1. Select menu option 4 | Display "Exiting the program. Goodbye!" Program terminates | | | Exit cleanly without errors |
| TC-020 | Balance Accuracy with Multiple Decimal Places | Balance is 1000.50 | 1. Select menu option 2; Enter 0.25<br/>2. Select menu option 1 | Display "New balance: 001000.75"<br/>View confirms: 001000.75 | | | System maintains precision with decimals |
| TC-021 | Menu Loop Continues After Invalid Input | Application at menu after invalid input | 1. Enter invalid value: 99<br/>2. Enter valid option: 1 | After invalid: "Invalid choice, please select 1-4." and return to menu<br/>After valid: Display current balance | | | Invalid input does not break menu loop |
| TC-022 | Boundary Test - Maximum Debit Amount | Balance is 999999.99 | 1. Select menu option 3<br/>2. Enter debit amount: 999999.99 | Display "Amount debited. New balance: 000000.00" | | | System handles maximum debit correctly |
| TC-023 | Boundary Test - Maximum Credit Amount | Balance is 0.00 | 1. Select menu option 2<br/>2. Enter credit amount: 999999.99 | Display "Amount credited. New balance: 999999.99" | | | System handles maximum credit correctly |
| TC-024 | Verify Data Persistence After Transactions | Series of transactions completed | 1. Perform credit of 500.00<br/>2. Verify balance view shows updated value<br/>3. Perform debit of 200.00<br/>4. Verify balance shows 300.00 | Each view operation displays the most recent balance after each transaction | | | Balance correctly persists through data layer |

---

## Test Coverage Summary

### Functional Areas Covered:

1. **Menu Navigation** (TC-012 to TC-014, TC-021)
   - Invalid menu selections
   - Menu loop continuity
   - All valid menu options (1-4)

2. **View Balance Operation** (TC-001, TC-006, TC-011, TC-017, TC-020, TC-024)
   - Initial balance retrieval
   - Balance after various transactions
   - Decimal precision

3. **Credit Account Operation** (TC-002 to TC-006, TC-015, TC-017, TC-020, TC-023)
   - Valid credit amounts
   - Small amounts (decimals)
   - Large amounts
   - Zero amounts
   - Maximum amounts
   - Sequential credits

4. **Debit Account Operation** (TC-007 to TC-011, TC-016 to TC-019, TC-022, TC-024)
   - Sufficient funds scenario
   - Exact balance debit
   - Insufficient funds rejection
   - Zero debit
   - Exceeding balance amounts
   - Sequential debits
   - Maximum debit

5. **Business Rules Validation**
   - Overdraft prevention (TC-009, TC-018, TC-019, TC-022)
   - Balance accuracy with decimals (TC-020)
   - Data persistence (TC-024)
   - Input validation (TC-012 to TC-014)

6. **System Stability**
   - Multiple transaction sequences (TC-015 to TC-017)
   - Mixed operations (TC-017)
   - Program exit (TC-019)

---

## Test Execution Notes

- **Total Test Cases**: 24
- **Prerequisites**: Application compiled and executable
- **Expected Duration**: ~30-45 minutes for manual execution
- **Pass Criteria**: All test cases execute as expected with no crashes or data inconsistencies

---

## Node.js Migration Mapping

These test cases are designed to be directly portable to a Node.js implementation:

| COBOL Component | Node.js Equivalent | Test Cases Using |
|---|---|---|
| MainProgram menu loop | Express.js routes or CLI prompts | TC-001 to TC-024 (all) |
| Operations program | Service layer/business logic | TC-002 to TC-024 |
| DataProgram storage | Database or in-memory store | TC-001, TC-006, TC-011, TC-024 |
| Balance calculations | JavaScript arithmetic operations | TC-002 to TC-023 |
| Validation logic | Input validation middleware/functions | TC-009, TC-012 to TC-014 |

---

## Notes for Business Stakeholders

- All test cases represent real user workflows
- The system implements strict overdraft prevention rules
- Balance data is maintained with 2 decimal place precision (currency format)
- The initial account balance is 1000.00
- Invalid user inputs are handled gracefully with re-prompting
- The system provides clear confirmation messages for all operations
