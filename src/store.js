import { reducer as reduxFormReducer } from 'redux-form'
import { createStore, combineReducers } from 'redux';

const reducer = combineReducers({
  form: reduxFormReducer, // mounted under "form"
});
const store = createStore(reducer);

export default store;
