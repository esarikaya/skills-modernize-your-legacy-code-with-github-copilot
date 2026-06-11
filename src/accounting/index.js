#!/usr/bin/env node

/**
 * Account Management System - Node.js Implementation
 * 
 * Converted from COBOL:
 * - main.cob (MainProgram)
 * - operations.cob (Operations)
 * - data.cob (DataProgram)
 * 
 * This application manages student account operations:
 * - View Balance
 * - Credit Account
 * - Debit Account
 * - Exit
 * 
 * Business Rules:
 * - Initial balance: 1000.00
 * - Overdraft prevention: Debits rejected if insufficient funds
 * - Balance precision: 2 decimal places
 */

const prompt = require('prompt-sync')({ sigint: true });
const { DataStore, Operations } = require('./lib');

/**
 * MainProgram - User Interface and Menu Loop
 * Mirrors the COBOL MainProgram functionality
 * 
 * PERFORM UNTIL CONTINUE-FLAG = 'NO'
 *   DISPLAY menu
 *   ACCEPT USER-CHOICE
 *   EVALUATE USER-CHOICE
 *     WHEN 1: CALL 'Operations' USING 'TOTAL '
 *     WHEN 2: CALL 'Operations' USING 'CREDIT'
 *     WHEN 3: CALL 'Operations' USING 'DEBIT '
 *     WHEN 4: MOVE 'NO' TO CONTINUE-FLAG
 *     WHEN OTHER: DISPLAY error
 *   END-EVALUATE
 * END-PERFORM
 */
class MainProgram {
  constructor() {
    this.dataStore = new DataStore();
    this.operations = new Operations(this.dataStore);
    this.continueFlag = true;
  }

  /**
   * Display main menu
   */
  displayMenu() {
    console.log('--------------------------------');
    console.log('Account Management System');
    console.log('1. View Balance');
    console.log('2. Credit Account');
    console.log('3. Debit Account');
    console.log('4. Exit');
    console.log('--------------------------------');
  }

  /**
   * Get user choice and validate
   * @returns {number} User's menu choice
   */
  getUserChoice() {
    const choice = prompt('Enter your choice (1-4): ');
    return parseInt(choice);
  }

  /**
   * Process user menu selection
   * EVALUATE USER-CHOICE
   * @param {number} choice - Menu choice
   */
  processChoice(choice) {
    switch (choice) {
      // WHEN 1: CALL 'Operations' USING 'TOTAL '
      case 1:
        this.operations.viewBalance();
        console.log(this.operations.getLastMessage());
        break;

      // WHEN 2: CALL 'Operations' USING 'CREDIT'
      case 2: {
        const amountStr = prompt('Enter credit amount: ');
        const amount = parseFloat(amountStr);
        this.operations.creditAccount(amount);
        if (this.operations.getLastError()) {
          console.log(this.operations.getLastError());
        } else {
          console.log(this.operations.getLastMessage());
        }
        break;
      }

      // WHEN 3: CALL 'Operations' USING 'DEBIT '
      case 3: {
        const amountStr = prompt('Enter debit amount: ');
        const amount = parseFloat(amountStr);
        this.operations.debitAccount(amount);
        if (this.operations.getLastError()) {
          console.log(this.operations.getLastError());
        } else {
          console.log(this.operations.getLastMessage());
        }
        break;
      }

      // WHEN 4: MOVE 'NO' TO CONTINUE-FLAG
      case 4:
        this.continueFlag = false;
        break;

      // WHEN OTHER: DISPLAY "Invalid choice..."
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }

  /**
   * Main application loop
   * PERFORM UNTIL CONTINUE-FLAG = 'NO'
   */
  run() {
    while (this.continueFlag) {
      this.displayMenu();
      const choice = this.getUserChoice();
      this.processChoice(choice);
    }

    // DISPLAY "Exiting the program. Goodbye!"
    console.log('Exiting the program. Goodbye!');
  }
}

/**
 * Application Entry Point
 */
function main() {
  const app = new MainProgram();
  app.run();
}

// Run the application
main();
