
import { createStore, combineReducers } from 'redux';
import { Reducer } from '../Reducers/reducer';

const reducer = combineReducers({
    store: Reducer
})
let store = createStore(reducer);

export default store;