import axios from 'axios';
import React, { useEffect, useReducer } from 'react';
import Badge from 'react-bootstrap/Badge';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';
import ListGroup from 'react-bootstrap/ListGroup';
import { useParams } from 'react-router-dom';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import Product from '../components/Product';
import Rating from '../components/Rating';
import { getError } from '../utils';

const reducer = (state, action) => {
    switch (action.type) {
        case 'FETCH_REQUEST':
            return { ...state, loading: true };
        case 'FETCH_SUCCESS':
            return { ...state, products: action.payload, loading: false };
        case 'FETCH_FAIL':
            return { ...state, error: action.payload, loading: false };
        case 'FETCH_SELLER_REQUEST':
            return { ...state, loadingSeller: true };
        case 'FETCH_SELLER_SUCCESS':
            return { ...state, user: action.payload, loadingSeller: false };
        case 'FETCH_SELLER_FAIL':
            return { ...state, error: action.payload, loadingSeller: false };

        default:
            return state;
    }
};

export default function SellerScreen(props) {
    const [{ loading, error, products, loadingSeller, user }, dispatch] = useReducer(reducer, {
        products: [],
        user: {},
        loading: true,
        error: '',
    });

    const params = useParams();
    const { id: sellerId } = params;

    useEffect(() => {
        const fetchData = async () => {
            try {
                dispatch({ type: 'FETCH_REQUEST' });
                const result = await axios.get(`/api/products?seller=${sellerId}`);
                dispatch({ type: 'FETCH_SUCCESS', payload: result.data });

                dispatch({ type: 'FETCH_SELLER_REQUEST' });
                const user = await axios.get(`/api/users/seller/${sellerId}`);
                dispatch({ type: 'FETCH_SELLER_SUCCESS', payload: user.data });
            } catch (err) {
                dispatch({ type: 'FETCH_FAIL', payload: getError(err) });
                dispatch({ type: 'FETCH_SELLER_FAIL', payload: getError(err) });
            }
        };
        fetchData();
    }, [sellerId]);

    console.log(user.seller)

    return (
        <>
            <Row>
                <Col md={3}>
                    {loadingSeller ? (
                        <LoadingBox />
                    ) : error ? (
                        <MessageBox variant="danger">{error}</MessageBox>
                    ) : (
                        <Card>
                            <Card.Body>
                                <ListGroup variant="flush">
                                    <ListGroup.Item>
                                        <Row>
                                            <Card.Img
                                                className="thumbnail"
                                                src={user?.seller?.logo}
                                                alt={user?.seller?.name}
                                            />
                                        </Row>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <Row>
                                            <Col>{user?.seller?.name}</Col>
                                            <Col>
                                                <Badge bg="danger"> <a className="text-decoration-none text-white" href={`mailto:${user?.email}`}>Contact Seller</a></Badge>
                                            </Col>
                                        </Row>
                                    </ListGroup.Item>
                                    <ListGroup.Item>
                                        <div className="d-grid">
                                            <Rating
                                                rating={user?.seller?.rating}
                                                numReviews={user?.seller?.numReviews}
                                            ></Rating>
                                        </div>
                                    </ListGroup.Item>
                                </ListGroup>
                            </Card.Body>
                        </Card>
                    )}
                </Col>
                <Col md={9}>
                    <Row>
                        {loading ? (
                            <LoadingBox></LoadingBox>
                        ) : error ? (
                            <MessageBox variant="danger">{error}</MessageBox>
                        ) : (
                            <>
                                {products.length === 0 && <MessageBox>No Product Found</MessageBox>}
                                {products.map((product) => (
                                    <Col xs={6} md={4} lg={4} key={product.slug} className="mb-3">
                                        <Product key={product._id} product={product}></Product>
                                    </Col>

                                ))}
                            </>
                        )}
                    </Row>
                </Col>
            </Row >
        </>
    );
}