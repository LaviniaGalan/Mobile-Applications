import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import ExpenseList from "./expense/ExpenseList";
import { ExpenseProvider } from './expense/ExpenseProvider';
import ExpenseEdit from "./expense/ExpenseEdit";
import {AuthProvider, Login, PrivateRoute} from "./auth";

const App: React.FC = () => (
    <IonApp>
          <IonReactRouter>
            <IonRouterOutlet>
                <AuthProvider>
                    <Route path="/login" component={Login} exact={true}/>
                    <ExpenseProvider>
                        <PrivateRoute path="/expenses" component={ExpenseList} exact={true} />
                        <PrivateRoute path="/expense" component={ExpenseEdit} exact={true} />
                        <PrivateRoute path="/expense/:id" component={ExpenseEdit} exact={true} />
                    </ExpenseProvider>
                    <Route exact path="/" render={() => <Redirect to="/expenses" />} />
                </AuthProvider>
            </IonRouterOutlet>
          </IonReactRouter>

    </IonApp>
);


export default App;
