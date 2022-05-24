import React, { useContext, useReducer, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import { toast } from 'react-toastify';
import { getError } from '../utils';
import axios from 'axios';

const reducer = (state, action) => {
    switch (action.type) {
        case 'UPDATE_REQUEST':
            return { ...state, loadingUpdate: true };
        case 'UPDATE_SUCCESS':
            return { ...state, loadingUpdate: false };
        case 'UPDATE_FAIL':
            return { ...state, loadingUpdate: false };

        default:
            return state;
    }
};

export default function ProfileScreen() {
    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { userInfo } = state;
    const [name, setName] = useState(userInfo.name);
    const [email, setEmail] = useState(userInfo.email);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [sellerName, setSellerName] = useState('');
    const [sellerLogo, setSellerLogo] = useState('');
    const [sellerDescription, setSellerDescription] = useState('');

    const [{ loadingUpdate }, dispatch] = useReducer(reducer, {
        loadingUpdate: false,
    });

    const submitHandler = async (e) => {
        e.preventDefault();

        const updatedData = {
            name,
            email,
            password,
            sellerName,
            sellerLogo,
            sellerDescription
        }

        try {
            const { data } = await axios.put('/api/users/profile',
                updatedData,
                {
                    headers: { Authorization: `Bearer ${userInfo.token}` },
                }
            );

            dispatch({ type: 'UPDATE_SUCCESS' });

            ctxDispatch({ type: 'USER_SIGNIN', payload: data });
            localStorage.setItem('userInfo', JSON.stringify(data));
            toast.success('User updated successfully');
        } catch (err) {
            dispatch({ type: 'FETCH_FAIL' });
            toast.error(getError(err));
        }
    };

    return (
        <div className="container small-container">
            <Helmet>
                <title>User Profile</title>
            </Helmet>
            <h1 className="my-3">User Profile</h1>
            <form onSubmit={submitHandler}>
                <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="name">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                        type="password"
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3" controlId="password">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                        type="password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                </Form.Group>
                {userInfo.isSeller && (
                    <>
                        <h2>Seller</h2>
                        <Form.Group className="mb-3" controlId="sellerName">
                            <Form.Label>Seller Name</Form.Label>
                            <Form.Control
                                id="sellerName"
                                type="text"
                                placeholder="Enter Seller Name"
                                value={sellerName}
                                onChange={(e) => setSellerName(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="sellerLogo">
                            <Form.Label>Seller Logo</Form.Label>
                            <Form.Control
                                id="sellerLogo"
                                type="url"
                                placeholder="Enter Seller Logo"
                                value={sellerLogo}
                                onChange={(e) => setSellerLogo(e.target.value)}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="sellerDescription">
                            <Form.Label>Seller Description</Form.Label>
                            <Form.Control
                                id="sellerDescription"
                                type="text"
                                placeholder="Enter Seller Description"
                                value={sellerDescription}
                                onChange={(e) => setSellerDescription(e.target.value)}
                            />
                        </Form.Group>
                    </>
                )}
                <div className="mb-3">
                    <Button disabled={loadingUpdate} type="submit">Update</Button>
                </div>
            </form>
        </div>
    );
}