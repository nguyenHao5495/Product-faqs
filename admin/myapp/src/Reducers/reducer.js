
const initialState = {
    getaProduct: {}
}
const newQuestion = {
    dataQuestion: {}
}
function Reducer(state = initialState, actions = {}) {
    switch (actions.type) {
        case "DATA_PRODUCT":
            return {
                ...actions,
            }
        default:
    }

    return state;
}
function Reducer1(state = newQuestion, actions = {}) {
    switch (actions.type) {
        case "DATA_QUESTION":
            return {
                ...actions,
            }
        default:
    }

    return state;
}
export { Reducer, Reducer1 } 
