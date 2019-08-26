import { compose, createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';

import reducers from '../reducers';

const middleware = [thunk];

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

export default createStore(reducers, composeEnhancers(applyMiddleware(...middleware)));