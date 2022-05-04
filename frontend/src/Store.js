import { createContext, useReducer } from 'react';

export const Store = createContext();

const initialState = {
    cart: {
        cartItems: []
    }
};

const reducer = (state, action) => {
    switch (action.type) {
        case 'CART_ADD_ITEM':
            return {
                ...state,
                cart: {
                    ...state.cart,
                    cartItems: [...state.cart.cartItems, action.payload],
                },
            };
        default:
            return state;
    }
};

export const StoreProvider = (props) => {
    const [state, dispatch] = useReducer(reducer, initialState);
    const value = { state, dispatch };

    return <Store.Provider value={value}>{props.children}</Store.Provider>
};