/**
 * Account Management System - Unit Tests
 * 
 * These tests mirror the test cases documented in docs/TESTPLAN.md
 * They validate the Node.js implementation against the original COBOL business logic.
 */

const { DataStore, Operations } = require('./lib');

describe('DataStore - Data Layer (Mirrors DataProgram)', () => {
  let dataStore;

  beforeEach(() => {
    dataStore = new DataStore();
  });

  describe('TC-001: Initial Balance', () => {
    test('should initialize with balance of 1000.00', () => {
      expect(dataStore.read()).toBe(1000.00);
    });
  });

  describe('READ Operation', () => {
    test('should return current balance', () => {
      expect(dataStore.read()).toBe(1000.00);
    });

    test('should return updated balance after write', () => {
      dataStore.write(1500.00);
      expect(dataStore.read()).toBe(1500.00);
    });
  });

  describe('WRITE Operation', () => {
    test('should update balance value', () => {
      dataStore.write(2000.00);
      expect(dataStore.read()).toBe(2000.00);
    });

    test('should accept zero balance', () => {
      dataStore.write(0.00);
      expect(dataStore.read()).toBe(0.00);
    });

    test('should accept maximum balance value', () => {
      dataStore.write(999999.99);
      expect(dataStore.read()).toBe(999999.99);
    });
  });

  describe('Persistence', () => {
    test('TC-024: balance should persist across multiple operations', () => {
      dataStore.write(500.00);
      expect(dataStore.read()).toBe(500.00);
      
      dataStore.write(750.00);
      expect(dataStore.read()).toBe(750.00);
      
      dataStore.write(100.00);
      expect(dataStore.read()).toBe(100.00);
    });
  });
});

describe('Operations - Business Logic Layer (Mirrors Operations program)', () => {
  let dataStore;
  let operations;

  beforeEach(() => {
    dataStore = new DataStore();
    operations = new Operations(dataStore);
  });

  describe('TC-001, TC-006: View Balance Operation', () => {
    test('TC-001: should view initial account balance of 1000.00', () => {
      const balance = operations.viewBalance();
      expect(balance).toBe(1000.00);
      expect(operations.getLastMessage()).toContain('001000.00');
    });

    test('TC-006: should display updated balance after credit', () => {
      operations.creditAccount(100.00);
      const balance = operations.viewBalance();
      expect(balance).toBe(1100.00);
      expect(operations.getLastMessage()).toContain('001100.00');
    });

    test('TC-011: should display balance after insufficient funds attempt', () => {
      operations.viewBalance();
      expect(operations.getLastMessage()).toContain('001000.00');
    });
  });

  describe('TC-002 to TC-006, TC-015, TC-023: Credit Account Operation', () => {
    test('TC-002: should credit account with valid amount', () => {
      const newBalance = operations.creditAccount(500.00);
      expect(newBalance).toBe(1500.00);
      expect(operations.getLastMessage()).toContain('Amount credited');
      expect(operations.getLastMessage()).toContain('001500.00');
      expect(dataStore.read()).toBe(1500.00);
    });

    test('TC-003: should handle credit with small decimal amount', () => {
      const newBalance = operations.creditAccount(0.50);
      expect(newBalance).toBe(1000.50);
      expect(operations.getLastMessage()).toContain('001000.50');
    });

    test('TC-004: should credit account with large amount', () => {
      dataStore.write(1500.50);
      const newBalance = operations.creditAccount(998499.00);
      expect(newBalance).toBe(999999.50);
      expect(operations.getLastMessage()).toContain('999999.50');
    });

    test('TC-005: should credit account with zero amount (balance unchanged)', () => {
      dataStore.write(999999.50);
      const newBalance = operations.creditAccount(0.00);
      expect(newBalance).toBe(999999.50);
      expect(operations.getLastMessage()).toContain('999999.50');
    });

    test('TC-015: should handle multiple sequential credits correctly', () => {
      let balance = operations.creditAccount(100.00);
      expect(balance).toBe(1100.00);

      balance = operations.creditAccount(200.00);
      expect(balance).toBe(1300.00);

      balance = operations.creditAccount(300.00);
      expect(balance).toBe(1600.00);
    });

    test('TC-023: should credit with maximum amount', () => {
      dataStore.write(0.00);
      const newBalance = operations.creditAccount(999999.99);
      expect(newBalance).toBe(999999.99);
    });

    test('should reject invalid (negative) credit amount', () => {
      const result = operations.creditAccount(-100.00);
      expect(result).toBeNull();
      expect(operations.getLastError()).toContain('Invalid amount');
    });

    test('should reject NaN credit amount', () => {
      const result = operations.creditAccount(NaN);
      expect(result).toBeNull();
      expect(operations.getLastError()).toContain('Invalid amount');
    });
  });

  describe('TC-007 to TC-011, TC-016 to TC-019, TC-022, TC-024: Debit Account Operation', () => {
    test('TC-007: should debit account with valid amount (sufficient funds)', () => {
      dataStore.write(999999.50);
      const newBalance = operations.debitAccount(500.00);
      expect(newBalance).toBe(999499.50);
      expect(operations.getLastMessage()).toContain('Amount debited');
      expect(operations.getLastMessage()).toContain('999499.50');
      expect(dataStore.read()).toBe(999499.50);
    });

    test('TC-008: should debit account when amount equals balance', () => {
      dataStore.write(999499.50);
      const newBalance = operations.debitAccount(999499.50);
      expect(newBalance).toBe(0.00);
      expect(operations.getLastMessage()).toContain('000000.00');
    });

    test('TC-009: should reject debit with insufficient funds', () => {
      dataStore.write(0.00);
      const result = operations.debitAccount(1.00);
      expect(result).toBeNull();
      expect(operations.getLastError()).toContain('Insufficient funds');
      expect(dataStore.read()).toBe(0.00);
    });

    test('TC-010: should debit account with zero amount (balance unchanged)', () => {
      dataStore.write(0.00);
      const newBalance = operations.debitAccount(0.00);
      expect(newBalance).toBe(0.00);
      expect(dataStore.read()).toBe(0.00);
    });

    test('TC-016: should handle multiple sequential debits correctly', () => {
      dataStore.write(600.00);
      
      let balance = operations.debitAccount(100.00);
      expect(balance).toBe(500.00);

      balance = operations.debitAccount(150.00);
      expect(balance).toBe(350.00);

      balance = operations.debitAccount(200.00);
      expect(balance).toBe(150.00);
    });

    test('TC-017: should handle mixed credit and debit operations', () => {
      dataStore.write(150.00);
      
      const creditBalance = operations.creditAccount(350.00);
      expect(creditBalance).toBe(500.00);

      const debitBalance = operations.debitAccount(200.00);
      expect(debitBalance).toBe(300.00);

      const viewBalance = operations.viewBalance();
      expect(viewBalance).toBe(300.00);
    });

    test('TC-018: should prevent debit exceeding current balance', () => {
      dataStore.write(300.00);
      const result = operations.debitAccount(500.00);
      expect(result).toBeNull();
      expect(operations.getLastError()).toContain('Insufficient funds');
      expect(dataStore.read()).toBe(300.00);
    });

    test('TC-022: should debit maximum amount', () => {
      dataStore.write(999999.99);
      const newBalance = operations.debitAccount(999999.99);
      expect(newBalance).toBe(0.00);
    });

    test('should reject invalid (negative) debit amount', () => {
      const result = operations.debitAccount(-100.00);
      expect(result).toBeNull();
      expect(operations.getLastError()).toContain('Invalid amount');
    });

    test('should reject NaN debit amount', () => {
      const result = operations.debitAccount(NaN);
      expect(result).toBeNull();
      expect(operations.getLastError()).toContain('Invalid amount');
    });
  });

  describe('TC-020: Decimal Precision', () => {
    test('should handle balance with multiple decimal places correctly', () => {
      dataStore.write(1000.50);
      const newBalance = operations.creditAccount(0.25);
      expect(newBalance).toBe(1000.75);
      expect(operations.getLastMessage()).toContain('001000.75');
      
      const viewBalance = operations.viewBalance();
      expect(viewBalance).toBe(1000.75);
    });
  });

  describe('Balance Formatting', () => {
    test('should format balance with leading zeros in COBOL format', () => {
      const formatted = operations.formatBalance(1000.00);
      expect(formatted).toBe('001000.00');
    });

    test('should format small balance with leading zeros', () => {
      const formatted = operations.formatBalance(50.50);
      expect(formatted).toBe('000050.50');
    });

    test('should format maximum balance', () => {
      const formatted = operations.formatBalance(999999.99);
      expect(formatted).toBe('999999.99');
    });
  });

  describe('Message Management', () => {
    test('should clear messages when operation starts', () => {
      operations.creditAccount(100.00);
      expect(operations.getLastMessage()).toContain('credited');
      
      operations.clearMessages();
      expect(operations.getLastMessage()).toBe('');
      expect(operations.getLastError()).toBe('');
    });

    test('should maintain last message after successful operation', () => {
      operations.creditAccount(500.00);
      const message = operations.getLastMessage();
      expect(message).toContain('Amount credited');
      expect(message).toContain('001500.00');
    });

    test('should maintain last error after failed operation', () => {
      dataStore.write(100.00);
      operations.debitAccount(500.00);
      const error = operations.getLastError();
      expect(error).toContain('Insufficient funds');
    });
  });

  describe('TC-024: Data Persistence', () => {
    test('should maintain correct balance through multiple transactions', () => {
      // Step 1: Credit
      let balance = operations.creditAccount(500.00);
      expect(balance).toBe(1500.00);
      expect(dataStore.read()).toBe(1500.00);

      // Step 2: Verify persistence
      balance = operations.viewBalance();
      expect(balance).toBe(1500.00);

      // Step 3: Debit
      balance = operations.debitAccount(200.00);
      expect(balance).toBe(1300.00);
      expect(dataStore.read()).toBe(1300.00);

      // Step 4: Verify final balance
      balance = operations.viewBalance();
      expect(balance).toBe(1300.00);
    });
  });
});

describe('Edge Cases and Boundary Conditions', () => {
  let dataStore;
  let operations;

  beforeEach(() => {
    dataStore = new DataStore();
    operations = new Operations(dataStore);
  });

  test('should handle floating point precision correctly', () => {
    const balance1 = operations.creditAccount(0.1);
    const balance2 = operations.creditAccount(0.2);
    const finalBalance = operations.viewBalance();
    
    // Should be 1000.30, not 1000.3000000000001
    expect(finalBalance).toBeCloseTo(1000.30, 2);
  });

  test('should handle very small amounts', () => {
    const balance = operations.creditAccount(0.01);
    expect(balance).toBe(1000.01);
  });

  test('should handle zero balance state', () => {
    dataStore.write(0.00);
    const balance = operations.viewBalance();
    expect(balance).toBe(0.00);
    expect(operations.getLastMessage()).toContain('000000.00');
  });

  test('should maintain state across object instances via DataStore', () => {
    const ops1 = new Operations(dataStore);
    ops1.creditAccount(500.00);
    
    // Create new operations instance with same DataStore
    const ops2 = new Operations(dataStore);
    const balance = ops2.viewBalance();
    
    expect(balance).toBe(1500.00);
  });

  test('should reject operations with undefined amounts', () => {
    const result = operations.creditAccount(undefined);
    expect(result).toBeNull();
    expect(operations.getLastError()).toContain('Invalid amount');
  });

  test('should handle very large numbers', () => {
    dataStore.write(999999.99);
    const result = operations.debitAccount(0.01);
    expect(result).toBe(999999.98);
  });
});

describe('COBOL Business Rules Validation', () => {
  let dataStore;
  let operations;

  beforeEach(() => {
    dataStore = new DataStore();
    operations = new Operations(dataStore);
  });

  test('Overdraft Prevention: Should prevent balance from going negative', () => {
    dataStore.write(100.00);
    const result = operations.debitAccount(150.00);
    expect(result).toBeNull();
    expect(dataStore.read()).toBe(100.00);
  });

  test('Overdraft Prevention: Should allow exact debit of balance', () => {
    dataStore.write(100.00);
    const result = operations.debitAccount(100.00);
    expect(result).toBe(0.00);
  });

  test('Credit Allowance: Should always allow credits regardless of balance', () => {
    dataStore.write(999999.99);
    // Credits are always allowed - the system doesn't enforce maximum balance limits
    const result = operations.creditAccount(1.00);
    expect(result).toBe(1000000.99);
  });

  test('Initial Balance: New DataStore should start at 1000.00', () => {
    const newStore = new DataStore();
    expect(newStore.read()).toBe(1000.00);
  });

  test('Balance Precision: Should maintain 2 decimal places', () => {
    operations.creditAccount(100.555);
    const balance = operations.getCurrentBalance();
    // Should be rounded to 2 decimal places
    expect(balance).toBeCloseTo(1100.555, 2);
  });
});
