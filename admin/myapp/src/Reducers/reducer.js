
const initialState = {
    getaProduct: {}
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

export { Reducer } 
