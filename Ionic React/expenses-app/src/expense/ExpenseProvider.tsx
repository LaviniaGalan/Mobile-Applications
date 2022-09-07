import React, {useCallback, useContext, useEffect, useReducer, useState} from 'react';
import PropTypes from 'prop-types';
import { getLogger } from '../core';
import { ExpenseProps } from './ExpenseProps';
import {getExpenses, createExpense, updateExpense, newWebSocket, syncData} from "./expenseApi";
import {AuthContext} from "../auth";
import {Plugins} from "@capacitor/core";

import {useNetwork} from "./useNetwork";
import set = Reflect.set;

const {Storage} = Plugins;
const {Network} = Plugins;
const log = getLogger('ExpenseProvider');

type SaveExpenseFn = (expense: ExpenseProps) => Promise<any>;

export interface ExpensesState {
    expenses?: ExpenseProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveExpense?: SaveExpenseFn,

    networkStatus?: any,

    savedOffline?: boolean,
    setSavedOffline?: Function,

}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ExpensesState = {
    fetching: false,
    saving: false,
};

const FETCH_EXPENSES_STARTED = 'FETCH_EXPENSES_STARTED';
const FETCH_EXPENSES_SUCCEEDED = 'FETCH_EXPENSES_SUCCEEDED';
const FETCH_EXPENSES_FAILED = 'FETCH_EXPENSES_FAILED';
const SAVE_EXPENSE_STARTED = 'SAVE_EXPENSE_STARTED';
const SAVE_EXPENSE_SUCCEEDED = 'SAVE_EXPENSE_SUCCEEDED';
const SAVE_EXPENSE_FAILED = 'SAVE_EXPENSE_FAILED';

const reducer: (state: ExpensesState, action: ActionProps) => ExpensesState =
    (state, { type, payload }) => {
        switch(type) {
            case FETCH_EXPENSES_STARTED:
                return { ...state, fetching: true, fetchingError: null };
            case FETCH_EXPENSES_SUCCEEDED:
                return { ...state, expenses: payload.expenses, fetching: false };
            case FETCH_EXPENSES_FAILED:
                return { ...state, fetchingError: payload.error, fetching: false };
            case SAVE_EXPENSE_STARTED:
                return { ...state, savingError: null, saving: true };
            case SAVE_EXPENSE_SUCCEEDED:
                const expenses = [...(state.expenses || [])];
                const expense = payload.expense;
                const index = expenses.findIndex(exp => exp._id === expense._id);
                if (index === -1) {
                    expenses.splice(0, 0, expense);
                } else {
                    expenses[index] = expense;
                }
                return { ...state,  expenses, saving: false };
            case SAVE_EXPENSE_FAILED:
                return { ...state, savingError: payload.error, saving: false };
            default:
                return state;
        }
    };

export const ExpenseContext = React.createContext<ExpensesState>(initialState);

interface ExpenseProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
    const { token } = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const { expenses, fetching, fetchingError, saving, savingError } = state;
    const { networkStatus, setNetworkStatus } = useNetwork();
    useEffect(networkEffect, [token, setNetworkStatus]);

    const [ savedOffline, setSavedOffline ] = useState<boolean>(false);

    useEffect(getExpensesEffect, [token]);
    useEffect(wsEffect, [token]);


    const saveExpense = useCallback<SaveExpenseFn>(saveExpenseCallback, [token]);

    const value = { expenses, fetching, fetchingError, saving, savingError, saveExpense: saveExpense, networkStatus, savedOffline, setSavedOffline };
    log('returns');
    return (
        <ExpenseContext.Provider value={value}>
            {children}
        </ExpenseContext.Provider>
    );

    function networkEffect(){
        console.log("Network effect");
        let canceled = false;
        Network.addListener('networkStatusChange', async(status) => {
            if (canceled) return;
            const connected = status.connected;
            if(connected){
                console.log("Network effect - sync data");
                await syncData(token);
            }
            setNetworkStatus(status);
        });

        return () => {
            canceled = true;
        }
    }

    function getExpensesEffect() {
        let canceled = false;
        fetchExpenses();
        return () => {
            canceled = true;
        }

            async function fetchExpenses() {
            if (!token?.trim()) {
                return;
            }

            if (!navigator?.onLine) {
                let storageKeys = Storage.keys();
                const expenses = await storageKeys.then(async function (storageKeys) {
                    const expensesList = [];
                    for (let i = 0; i < storageKeys.keys.length; i++) {
                        if (storageKeys.keys[i] !== "user") {
                            const expense = await Storage.get({key : storageKeys.keys[i]});
                            if (expense.value != null) {
                                var parsedExpense = JSON.parse(expense.value);
                            }
                            expensesList.push(parsedExpense);
                        }
                    }
                    return expensesList;
                });
                dispatch({type: FETCH_EXPENSES_SUCCEEDED, payload: {expenses: expenses}});

            } else {

                try {
                    log('fetchExpenses started');
                    dispatch({type: FETCH_EXPENSES_STARTED});
                    const expenses = await getExpenses(token);
                    log('fetchExpenses successful');
                    if (!canceled) {
                        dispatch({type: FETCH_EXPENSES_SUCCEEDED, payload: {expenses: expenses}})
                        console.log(expenses);
                    }
                } catch (error) {
                    let storageKeys = Storage.keys();
                    const expenses = await storageKeys.then(async function (storageKeys) {
                        const expensesList = [];
                        for (let i = 0; i < storageKeys.keys.length; i++) {
                            if (storageKeys.keys[i] !== "user") {
                                const expense = await Storage.get({key : storageKeys.keys[i]});
                                if (expense.value != null){
                                    var parsedExpense = JSON.parse(expense.value);

                                }
                                expensesList.push(parsedExpense);
                            }
                        }
                        return expensesList;
                    });
                    dispatch({type: FETCH_EXPENSES_SUCCEEDED, payload: {expenses: expenses}});
                }
            }
        }
    }


    async function saveExpenseCallback(expense: ExpenseProps) {
        try {
            if (navigator.onLine) {
                log('saveExpense started');
                dispatch({ type: SAVE_EXPENSE_STARTED });
                const savedExpense = await (expense._id ? updateExpense(token, expense) : createExpense(token, expense));
                log('saveExpense succeeded');
                dispatch({ type: SAVE_EXPENSE_SUCCEEDED, payload: { expense: savedExpense } });
            }
            else {
                console.log('saveExpense offline');
                log('saveExpense failed');
                expense._id = (expense._id === undefined) ? ('_' + Math.random().toString(36).substr(2, 9)) : expense._id;
                await Storage.set({
                    key: expense._id!,
                    value: JSON.stringify({
                        _id: expense._id,
                        product: expense.product,
                        price: expense.price,
                        date: expense.date,
                        withCreditCard: expense.withCreditCard,
                        latitude: expense.latitude,
                        longitude: expense.longitude,
                        webViewPath: expense.webViewPath
                    })
                });
                dispatch({type: SAVE_EXPENSE_SUCCEEDED, payload: {expense : expense}});
                setSavedOffline(true);
            }

        } catch (error) {
            log('saveExpense failed');
            await Storage.set({
                key: String(expense._id),
                value: JSON.stringify(expense)
            })
            dispatch({type: SAVE_EXPENSE_SUCCEEDED, payload: {expense : expense}});
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const { type, payload: expense } = message;
                log(`ws message, expense ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({ type: SAVE_EXPENSE_SUCCEEDED, payload: { expense } });
                }
            });
        }
        return () => {
            log('wsEffect - disconnecting');
            canceled = true;
            closeWebSocket?.();
        }
    }
};
