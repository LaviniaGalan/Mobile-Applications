import Router from 'koa-router';
import expenseStore from './store';
import { broadcast } from "../utils";

export const router = new Router();

router.get('/', async (ctx) => {
  const response = ctx.response;
  const userId = ctx.state.user._id;
  response.body = await expenseStore.find({ userId });
  response.status = 200; // ok
});

router.get('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const expense = await expenseStore.findOne({ _id: ctx.params._id });
  const response = ctx.response;
  if (expense) {
    if (expense.userId === userId) {
      response.body = expense;
      response.status = 200; // ok
    } else {
      response.status = 403; // forbidden
    }
  } else {
    response.status = 404; // not found
  }
});

const createExpense = async (ctx, expense, response) => {
  try {
    const userId = ctx.state.user._id;
    expense.userId = userId;
    response.body = await expenseStore.insert(expense);
    response.status = 201; // created
    broadcast(userId, { type: 'created', payload: expense });
  } catch (err) {
    response.body = { message: err.message };
    response.status = 400; // bad request
  }
};

router.post('/', async ctx => await createExpense(ctx, ctx.request.body, ctx.response));

router.put('/:id', async (ctx) => {
  const expense = ctx.request.body;
  const id = ctx.params.id;
  const expenseId = expense._id;
  const response = ctx.response;
  if (expenseId && expenseId !== id) {
    response.body = { message: 'Param id and body _id should be the same' };
    response.status = 400; // bad request
    return;
  }
  if (!expenseId) {
    await createExpense(ctx, expense, response);
  } else {
    console.log("e ok");
    const userId = ctx.state.user._id;
    expense.userId = userId;
    const updatedCount = await expenseStore.update({ _id: id }, expense);
    if (updatedCount === 1) {
      response.body = expense;
      response.status = 200; // ok
      broadcast(userId, { type: 'updated', payload: expense });
    } else {
      response.body = { message: 'Resource no longer exists' };
      response.status = 405; // method not allowed
    }
  }
});

router.del('/:id', async (ctx) => {
  const userId = ctx.state.user._id;
  const expense = await expenseStore.findOne({ _id: ctx.params._id });
  if (expense && userId !== expense.userId) {
    ctx.response.status = 403; // forbidden
  } else {
    await expenseStore.remove({ _id: ctx.params._id });
    ctx.response.status = 204; // no content
  }
});
