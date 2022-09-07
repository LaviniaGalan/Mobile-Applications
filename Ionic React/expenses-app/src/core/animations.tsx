import {createAnimation} from "@ionic/react";


export function generateSimpleAnimation(selector: string) {
    const el = document.querySelector(selector);
    if (el) {
        const animation = createAnimation()
            .addElement(el)
            .duration(800)
            .direction('alternate')
            .iterations(Infinity)
            .keyframes([
                { offset: 0, transform: 'scale(1.7)', opacity: '1' },
                { offset: 1, transform: 'scale(1)', opacity: '0.6' }
            ]);
        return animation;
    }
}


export function generateValidationAnimation(selector: string){
    const el = document.querySelector(selector);
    if (el) {
        const animation = createAnimation()
            .addElement(el)
            .duration(200)
            .direction('alternate')
            .iterations(6)
            .keyframes([
                { offset: 0, transform: 'translateX(0)', opacity: '1' },
                { offset: 1, transform: 'translateX(200px)', opacity: '0.6'}
            ]);

        return animation;
    }
}
