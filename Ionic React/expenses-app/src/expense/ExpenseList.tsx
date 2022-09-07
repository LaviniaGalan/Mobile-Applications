import React, {useContext, useEffect, useState} from 'react';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonLabel,
    IonSearchbar,
    IonSelectOption,
    IonSelect,
    IonInfiniteScroll,
    IonInfiniteScrollContent
} from '@ionic/react';
import {add, logOut} from 'ionicons/icons';
import Expense from './Expense';
import { getLogger } from '../core';
import {ExpenseContext} from "./ExpenseProvider";
import {RouteComponentProps} from "react-router";
import {AuthContext} from "../auth";
import {ExpenseProps} from "./ExpenseProps";

const log = getLogger('ExpenseList');

const offset = 3;
const filterList = [0, 10, 50, 100, 500];

const ExpenseList: React.FC<RouteComponentProps> = ({ history }) => {
    const { logout } = useContext(AuthContext);
    const { expenses, fetching, fetchingError, networkStatus } = useContext(ExpenseContext);

    const [filter, setFilter] = useState<string | undefined>(undefined);
    const [search, setSearch] = useState<string>("");
    const [disableInfiniteScroll, setDisabledInfiniteScroll] = useState<boolean>(false);
    const [visibleExpenses, setVisibleExpenses] = useState<ExpenseProps[] | undefined>([]);
    const [page, setPage] = useState(offset);

    useEffect(searchEffect, [search]);
    useEffect(filterEffect, [filter]);
    useEffect(paginationEffect, [expenses]);

    function searchEffect(){
        if(search !== "" && expenses){
            setVisibleExpenses(expenses.filter(e => e.product.toLowerCase().startsWith(search.toLowerCase())));
        }
        else {
            setVisibleExpenses(expenses);
        }
    }

    function filterEffect(){
        if(filter && expenses){
            setVisibleExpenses(expenses.filter(e => e.price >= Number(filter)));
        }
    }

    function paginationEffect(){
        if (expenses?.length && expenses?.length > 0) {
            setPage(offset);
            fetchData();
            console.log(expenses);
        }
    }

    function fetchData() {
        console.log("fetching...");
        setVisibleExpenses(expenses?.slice(0, page + offset));
        console.log(visibleExpenses);
        setPage(page + offset);
        if (expenses && page > expenses?.length) {
            setDisabledInfiniteScroll(true);
            setPage(expenses.length);
        } else {
            setDisabledInfiniteScroll(false);
        }
    }

    async function searchNext($event: CustomEvent<void>) {
        fetchData();
        await ($event.target as HTMLIonInfiniteScrollElement).complete();
    }

    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Expenses Manager</IonTitle>
                    <IonLabel>     Network Status: {networkStatus.connected && ("Connected, ")}
                        {! networkStatus.connected && ("Not Connected, ")}
                        connection type: {networkStatus.connectionType}</IonLabel>

                    <IonSearchbar value={search} onIonChange={(e) => setSearch(e.detail.value!)}>

                    </IonSearchbar>

                    <IonSelect value={filter} placeholder="Lower bound for price" onIonChange={(e) => setFilter(e.detail.value!)}>
                        {filterList.map((filterPrice) => (
                            <IonSelectOption key={filterPrice} value={filterPrice}>
                                {filterPrice}
                            </IonSelectOption>
                        ))}
                    </IonSelect>

                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching expenses" />

                {
                    visibleExpenses &&(

                        <IonList>
                            {Array.from(visibleExpenses)
                                .filter(each => {
                                    if (filter !== undefined)
                                        return each.price >= Number(filter) && each._id !== undefined;
                                    return each._id !== undefined;
                                })
                            .map(({ _id, product, price, date, withCreditCard, longitude, latitude, webViewPath}) =>
                                <Expense key={_id} _id={_id} product={product} price={price} date={date} withCreditCard={withCreditCard} longitude={longitude} latitude={latitude} webViewPath={webViewPath} onEdit={id => history.push(`/expense/${id}`)}/>)}
                                </IonList>
                    )
                }

                <IonInfiniteScroll threshold="100px" disabled={disableInfiniteScroll} onIonInfinite={(e: CustomEvent<void>) => searchNext(e)}>
                    <IonInfiniteScrollContent loadingText="Loading...">
                    </IonInfiniteScrollContent>
                </IonInfiniteScroll>


                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch expenses'}</div>
                )}

                <IonFab vertical="bottom" horizontal="end" slot="fixed" className="addButton">
                    <IonFabButton onClick={() => history.push('/expense')}>
                        <IonIcon icon={add} />
                    </IonFabButton>
                </IonFab>

                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton onClick={() => {
                        log("Logout!");
                        logout?.();
                    }}>
                        <IonIcon icon={logOut} />
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );

};

export default ExpenseList;
