/**
 * Account Management System - Business Logic Library
 * 
 * This module contains the core business logic extracted from the COBOL application.
 * It provides the DataStore and Operations classes that can be tested independently
 * from CLI interactions.
 */

/**
 * DataStore - Persistent Data Storage Layer
 * Mirrors the COBOL DataProgram functionality
 */
class DataStore {
  constructor() {
    // STORAGE-BALANCE: PIC 9(6)V99 VALUE 1000.00
    this.storageBalance = 1000.00;
  }

  /**
   * READ operation - Retrieves current balance
   * @returns {number} Current balance
   */
  read() {
    return this.storageBalance;
  }

  /**
   * WRITE operation - Updates balance
   * @param {number} balance - New balance to store
   */
  write(balance) {
    this.storageBalance = balance;
  }

  /**
   * Reset balance to initial value (useful for testing)
   */
  reset() {
    this.storageBalance = 1000.00;
  }
}

/**
 * Operations - Business Logic Layer
 * Mirrors the COBOL Operations program functionality
 * Separated from UI for testability
 */
class Operations {
  constructor(dataStore) {
    // FINAL-BALANCE: PIC 9(6)V99 VALUE 1000.00
    this.finalBalance = 1000.00;
    this.dataStore = dataStore;
    this.lastMessage = '';
    this.lastError = '';
  }

  /**
   * Get the last operation message
   * @returns {string} Last message from operation
   */
  getLastMessage() {
    return this.lastMessage;
  }

  /**
   * Get the last error message
   * @returns {string} Last error from operation
   */
  getLastError() {
    return this.lastError;
  }

  /**
   * Clear messages
   */
  clearMessages() {
    this.lastMessage = '';
    this.lastError = '';
  }

  /**
   * TOTAL operation - View current balance
   * Equivalent to: CALL 'DataProgram' USING 'READ'
   * @returns {number} Current balance
   */
  viewBalance() {
    this.finalBalance = this.dataStore.read();
    this.lastMessage = `Current balance: ${this.formatBalance(this.finalBalance)}`;
    this.lastError = '';
    return this.finalBalance;
  }

  /**
   * CREDIT operation - Add funds to account
   * @param {number} amount - Amount to credit
   * @returns {number} New balance after credit
   */
  creditAccount(amount) {
    this.clearMessages();

    if (isNaN(amount) || amount < 0) {
      this.lastError = 'Invalid amount. Please enter a positive number.';
      return null;
    }

    // CALL 'DataProgram' USING 'READ'
    this.finalBalance = this.dataStore.read();

    // ADD AMOUNT TO FINAL-BALANCE
    this.finalBalance += amount;

    // CALL 'DataProgram' USING 'WRITE'
    this.dataStore.write(this.finalBalance);

    this.lastMessage = `Amount credited. New balance: ${this.formatBalance(this.finalBalance)}`;
    return this.finalBalance;
  }

  /**
   * DEBIT operation - Withdraw funds from account
   * @param {number} amount - Amount to debit
   * @returns {number|null} New balance after debit, or null if insufficient funds
   */
  debitAccount(amount) {
    this.clearMessages();

    if (isNaN(amount) || amount < 0) {
      this.lastError = 'Invalid amount. Please enter a positive number.';
      return null;
    }

    // CALL 'DataProgram' USING 'READ'
    this.finalBalance = this.dataStore.read();

    // IF FINAL-BALANCE >= AMOUNT
    if (this.finalBalance >= amount) {
      // SUBTRACT AMOUNT FROM FINAL-BALANCE
      this.finalBalance -= amount;

      // CALL 'DataProgram' USING 'WRITE'
      this.dataStore.write(this.finalBalance);

      this.lastMessage = `Amount debited. New balance: ${this.formatBalance(this.finalBalance)}`;
      return this.finalBalance;
    } else {
      // ELSE: Insufficient funds
      this.lastError = 'Insufficient funds for this debit.';
      return null;
    }
  }

  /**
   * Format balance to COBOL format: PIC 9(6)V99
   * Example: 1000.00 becomes "001000.00"
   * @param {number} balance - Balance to format
   * @returns {string} Formatted balance
   */
  formatBalance(balance) {
    return balance.toFixed(2).padStart(9, '0');
  }

  /**
   * Get current balance without updating
   * @returns {number} Current balance
   */
  getCurrentBalance() {
    return this.dataStore.read();
  }
}

module.exports = {
  DataStore,
  Operations
};
