import React, { useContext, useEffect, useState } from 'react';
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonInput,
    IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonCheckbox,
    IonLabel,
    IonItem, createAnimation
} from '@ionic/react';
import { getLogger } from '../core';
import { ExpenseContext } from './ExpenseProvider';
import { RouteComponentProps } from 'react-router';
import { ExpenseProps } from './ExpenseProps';
import {useMyLocation} from "../core/useMyLocation";
import {usePhotoGallery} from "../core/usePhotoGallery";
import {MyMap} from '../core/MyMap';
import {generateSimpleAnimation, generateValidationAnimation} from "../core/animations";

const log = getLogger('ExpenseEdit');

interface ExpenseEditProps extends RouteComponentProps<{
    id?: string;
}> {}

const ExpenseEdit: React.FC<ExpenseEditProps> = ({ history, match }) => {
    const { expenses, saving, savingError, saveExpense } = useContext(ExpenseContext);
    const [product, setProduct] = useState('');
    const [price, setPrice] = useState(0);
    const [date, setDate] = useState(new Date());
    const [withCreditCard, setWithCreditCard] = useState(false);
    const [expense, setExpense] = useState<ExpenseProps>();

    const [longitude, setLongitude] = useState<number | undefined>(undefined);
    const [latitude, setLatitude] = useState<number | undefined>(undefined);
    const [currentLongitude, setCurrentLongitude] = useState<number | undefined>(undefined);
    const [currentLatitude, setCurrentLatitude] = useState<number | undefined>(undefined);
    const [webViewPath, setWebViewPath] = useState('');

    const location = useMyLocation();
    const {latitude : lat, longitude : lng} = location.position?.coords || {};

    const {takePhoto} = usePhotoGallery();


    useEffect(() => {
        clickOnMap('useEffect');
        const routeId = match.params.id || '';
        const expense = expenses?.find(exp => exp._id === routeId);
        setExpense(expense);
        if (expense) {
            setProduct(expense.product);
            setPrice(expense.price);
            setDate(expense.date);
            setWithCreditCard(expense.withCreditCard);
            setLongitude(expense.longitude);
            setLatitude(expense.latitude);
            setWebViewPath(expense.webViewPath);
        }
    }, [match.params.id, expenses]);

    useEffect(() => {
        if (latitude === undefined && longitude === undefined) {
            setCurrentLatitude(lat);
            setCurrentLongitude(lng);
        } else {
            setCurrentLatitude(latitude);
            setCurrentLongitude(longitude);
        }
    }, [lat, lng, longitude, latitude]);

    function setLocation() {
        setLatitude(currentLatitude);
        setLongitude(currentLongitude);
    }

    async function handlePhotoChange() {
        const image = await takePhoto();
        if (!image) {
            setWebViewPath('');
        } else {
            setWebViewPath(image);
        }
    }

    const handleSave = () => {
        const editedExpense = expense ? { ...expense, product, price, date, withCreditCard, longitude, latitude, webViewPath } : { product, price, date, withCreditCard, longitude, latitude, webViewPath };

        const animationsList = validateByAnimations();
        if(animationsList.length > 0){
            const parentAnimation = createAnimation()
                .duration(100)
                .direction('alternate')
                .iterations(6)
                .addAnimation(animationsList);
            parentAnimation.play();
        }
        else{
            saveExpense && saveExpense(editedExpense).then(() => history.goBack());
        }
    };
    clickOnMap('render');

    useEffect(() =>{
        const animation = generateSimpleAnimation('.saveButton');
        animation?.play();
    }, []);



    function validateByAnimations(){
        let animationsList = [];
        if(! product){
            const animation = generateValidationAnimation('.productItem');
            if(animation){
                animationsList.push(animation);
            }
        }
        if(price === 0){
            const animation = generateValidationAnimation('.priceItem');
            if(animation){
                animationsList.push(animation);
            }
        }
        return animationsList;
    }


    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave} className="saveButton">
                            Save
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem className="productItem">
                <IonLabel>Product: </IonLabel>
                <IonInput value={product} onIonChange={e => setProduct(e.detail.value || '')} />
                </IonItem>

                <IonItem className="priceItem">
                <IonLabel>Price: </IonLabel>
                <IonInput type="number" value={price} onIonChange={e => setPrice(parseInt(e.detail.value!))} />
                </IonItem>

                <IonLabel>Date: </IonLabel>
                <IonInput type="date" value={new Date(date).toISOString().split('T')[0]} onIonChange={e => setDate(new Date(e.detail.value || ""))} />

                <IonLabel>Paid with credit card: </IonLabel>
                <IonCheckbox checked={withCreditCard} onIonChange={e => setWithCreditCard(e.detail.checked)}/>
                <br></br>


                {webViewPath && (<img onClick={handlePhotoChange} src={webViewPath} width={'100px'} height={'100px'}/>)}
                {!webViewPath && (<img onClick={handlePhotoChange} src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>)}
                <br></br>

                <IonLabel>Location:</IonLabel>
                {lat && lng &&
                <MyMap
                    lat={currentLatitude}
                    lng={currentLongitude}
                    onMapClick={clickOnMap('onMap')}
                    onMarkerClick={clickOnMap('onMarker')}
                />
                }
                <IonButton onClick={setLocation}>Set location</IonButton>

                <IonLoading isOpen={saving} />
                {savingError && (
                    <div>{savingError.message || 'Failed to save expense!'}</div>
                )}
            </IonContent>
        </IonPage>
    );

    function clickOnMap(source: string) {
        return (e: any) => {
            setCurrentLatitude(e.latLng.lat());
            setCurrentLongitude(e.latLng.lng());
            console.log(source, e.latLng.lat(), e.latLng.lng());
        }
    }
};

export default ExpenseEdit;
