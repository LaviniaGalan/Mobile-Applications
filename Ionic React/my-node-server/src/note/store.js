import dataStore from 'nedb-promise';

export class ExpenseStore {
  constructor({ filename, autoload }) {
    this.store = dataStore({ filename, autoload });
  }
  
  async find(props) {
    return this.store.find(props);
  }
  
  async findOne(props) {
    return this.store.findOne(props);
  }
  
  async insert(expense) {
    let product = expense.product;
    if (!product) { // validation
      throw new Error('Missing product')
    }
    return this.store.insert(expense);
  };
  
  async update(props, expense) {
    return this.store.update(props, expense);
  }
  
  async remove(props) {
    return this.store.remove(props);
  }
}

export default new ExpenseStore({ filename: './db/expenses.json', autoload: true });
