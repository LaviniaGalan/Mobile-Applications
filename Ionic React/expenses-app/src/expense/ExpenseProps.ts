export interface ExpenseProps {
    _id?: string;
    product: string;
    price: number;
    date: Date;
    withCreditCard: boolean;
    longitude?: number;
    latitude?: number;
    webViewPath: string;
}
