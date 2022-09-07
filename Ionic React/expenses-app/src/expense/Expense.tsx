import React, {useEffect, useState} from 'react';
import {createAnimation, IonItem, IonLabel, IonModal, IonButton, IonContent} from '@ionic/react';
import { ExpenseProps } from './ExpenseProps';


interface ExpensePropsExt extends ExpenseProps {
    onEdit: (id?: string) => void;
}

const Expense: React.FC<ExpensePropsExt> = ({ _id, product, price, date, withCreditCard , longitude, latitude, webViewPath, onEdit}) => {
    const [showModal, setShowModal] = useState(false);

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }


    return (
        <IonItem >
            <div>
            <div onClick={() => onEdit(_id)}>
            <IonLabel color="primary">{product}</IonLabel>
            <IonLabel>Price: {price}</IonLabel>
            <IonLabel>Bought on: {new Date(date).toLocaleDateString()}</IonLabel>
            <IonLabel>
                {withCreditCard && ("with credit card")}
                {!withCreditCard && ("with cash")}
            </IonLabel>
            <IonLabel>Longitude: {longitude}</IonLabel>
            <IonLabel>Latitude: {latitude}</IonLabel>
            </div>
                {webViewPath && (<img id="image" src={webViewPath} onClick={() => setShowModal(true)} width={'100px'} height={'100px'} />)}

                {!webViewPath && (<img src={'https://us.123rf.com/450wm/pavelstasevich/pavelstasevich1811/pavelstasevich181101028/112815904-no-image-available-icon-flat-vector-illustration.jpg?ver=6'} onClick={() => setShowModal(true)} width={'100px'} height={'100px'} />)}


            <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>

                {webViewPath && (<img id="image" src={webViewPath} width={'500px'} height={'500px'} />)}

                {!webViewPath && (<img src={'https://us.123rf.com/450wm/pavelstasevich/pavelstasevich1811/pavelstasevich181101028/112815904-no-image-available-icon-flat-vector-illustration.jpg?ver=6'} width={'500px'} height={'500px'} />)}

                <IonButton onClick={() => setShowModal(false)}>Close Modal</IonButton>
            </IonModal>

            </div>
        </IonItem>
    );
};

export default Expense;
