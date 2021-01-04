import reducer from './reducer';

import { createStore, combineReducers } from 'redux';
import { Reducer } from '../reducers/reducer';

const reducer = combineReducers({
    store: Reducer,
})
let store = createStore(reducer);

export default store;
export { reducer };