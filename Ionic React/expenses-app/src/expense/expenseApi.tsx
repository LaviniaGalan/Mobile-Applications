import axios from 'axios';
import {authConfig, getLogger} from '../core';
import { ExpenseProps } from './ExpenseProps';

import {Plugins} from "@capacitor/core";

const {Storage} = Plugins;

const log = getLogger('expenseApi');

const baseUrl = 'localhost:3000';
const expenseUrl = `http://${baseUrl}/api/expense`;


interface ResponseProps<T> {
    data: T;
}

function withLogs<T>(promise: Promise<ResponseProps<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        });
}

const config = {
    headers: {
        'Content-Type': 'application/json'
    }
};

export const getExpenses: (token: string) => Promise<ExpenseProps[]> = token => {
    try {
        console.log("AM INTRAT IN GET EXPENSES");
        var result = axios.get(expenseUrl, authConfig(token));
        result.then(async result => {
            for (const each of result.data) {
                await Storage.set({
                    key: each._id!,
                    value: JSON.stringify({
                        _id: each._id,
                        product: each.product,
                        price: each.price,
                        date: each.date,
                        withCreditCard: each.withCreditCard,
                        latitude: each.latitude,
                        longitude: each.longitude,
                        webViewPath: each.webViewPath
                    })
                });
            }
        }).catch(err => {
            if (err.response) {
                console.log('client received an error response (5xx, 4xx)');
            } else if (err.request) {
                console.log('client never received a response, or request never left');
            } else {
                console.log('anything else');
            }
        })
        console.log("GET EXPENSES FROM SERVER");
        console.log(result);
        return withLogs(result, 'getExpenses');
    } catch (error) {
        throw error;
    }
}

export const createExpense: (token:string, expense: ExpenseProps) => Promise<ExpenseProps[]> = (token, expense) => {

    //return withLogs(axios.post(expenseUrl, expense, authConfig(token)), 'createExpense');
    var result = axios.post(expenseUrl, expense, authConfig(token));
    result.then(async result => {
        var addedExpense = result.data;
        await Storage.set({
            key: addedExpense._id!,
            value: JSON.stringify({
                _id: addedExpense._id,
                product: addedExpense.product,
                price: addedExpense.price,
                date: addedExpense.date,
                withCreditCard: addedExpense.withCreditCard,
                latitude: addedExpense.latitude,
                longitude: addedExpense.longitude,
                webViewPath: addedExpense.webViewPath
            })
        });
    }).catch(err => {
        if (err.response) {
            console.log('client received an error response (5xx, 4xx)');
        } else if (err.request) {
            alert('client never received a response, or request never left');
        } else {
            console.log('anything else');
        }
    });
    return withLogs(result, 'createExpense');
}

export const updateExpense: (token:string, expense: ExpenseProps) => Promise<ExpenseProps[]> = (token, expense) => {
    //return withLogs(axios.put(`${expenseUrl}/${expense._id}`, expense, authConfig(token)), 'updateExpense');

    log(expense);
    var result = axios.put(`${expenseUrl}/${expense._id}`, expense, authConfig(token));
    result.then(async result => {
        var updatedExpense = result.data;
        await Storage.set({
            key: updatedExpense._id!,
            value: JSON.stringify({
                _id: updatedExpense._id,
                product: updatedExpense.product,
                price: updatedExpense.price,
                date: updatedExpense.date,
                withCreditCard: updatedExpense.withCreditCard,
                latitude: updatedExpense.latitude,
                longitude: updatedExpense.longitude,
                webViewPath: updatedExpense.webViewPath
            })
        });
    }).catch(err => {
        if (err.response) {
            console.log('Client received an error response (5xx, 4xx)');
        } else if (err.request) {
            alert('Client never received a response, or request never left');
        } else {
            console.log('Other error');
        }
    });
    return withLogs(result, 'updateExpense');
}

const different = (expense1: ExpenseProps, expense2: ExpenseProps) => {
    return !(expense1.product === expense2.product &&
        expense1.price === expense2.price &&
        expense1.date === expense2.date &&
        expense1.withCreditCard === expense2.withCreditCard);

}

export const syncData: (token: string) => Promise<ExpenseProps[]> = async token => {
    try {
        const { keys } = await Storage.keys();
        var result = axios.get(expenseUrl, authConfig(token));
        result.then(async result => {
            var changes = 0;
            for (const i of keys) {
                if (i !== 'user') {
                    const expenseOnServer = result.data.find((each: { _id: string; }) => each._id === i);
                    const localExpense = await Storage.get({key: i});

                    console.log('Expense on server: ' + JSON.stringify(expenseOnServer));
                    console.log('Expense locally: ' + localExpense.value!);

                    if (expenseOnServer !== undefined && different(expenseOnServer, JSON.parse(localExpense.value!))) {
                        console.log('Update ' + localExpense.value);
                        axios.put(`${expenseUrl}/${i}`, JSON.parse(localExpense.value!), authConfig(token));
                        changes = 1;

                    } else if (expenseOnServer === undefined){
                        console.log('Create' + localExpense.value!);
                        axios.post(expenseUrl, JSON.parse(localExpense.value!), authConfig(token));
                        changes = 1;
                    }
                }
            }
            if(changes != 0){
                alert("The data was synced!");
            }

        }).catch(err => {
            if (err.response) {
                console.log('Client received an error response (5xx, 4xx)');
            } else if (err.request) {
                console.log('Client never received a response, or request never left');
            } else {
                console.log('Other error');
            }
        })
        return withLogs(result, 'syncData');
    } catch (error) {
        throw error;
    }
}




interface MessageData {
    type: string;
    payload: ExpenseProps;
}

export const newWebSocket = (token: string, onMessage: (data: MessageData) => void) => {
    const ws = new WebSocket(`ws://${baseUrl}`)
    ws.onopen = () => {
        log('web socket onopen');
        ws.send(JSON.stringify({ type: 'authorization', payload: { token } }));
    };
    ws.onclose = () => {
        log('web socket onclose');
    };
    ws.onerror = error => {
        log('web socket onerror', error);
    };
    ws.onmessage = messageEvent => {
        log('web socket onmessage');
        onMessage(JSON.parse(messageEvent.data));
    };
    return () => {
        ws.close();
    }
}
