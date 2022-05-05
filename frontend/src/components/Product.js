import Card from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import { Link } from 'react-router-dom';
import Rating from './Rating';
import { useContext } from 'react';
import { Store } from '../Store';
import axios from 'axios';

const Product = (props) => {
    const { product } = props;

    const { state, dispatch: ctxDispatch } = useContext(Store);
    const { cart } = state;

    const addToCartHandler = async (item) => {
        const existItem = cart.cartItems?.find((x => x._id === product._id));
        const quantity = existItem ? existItem.quantity + 1 : 1;

        const { data } = await axios.get(`/api/products/${item._id}`);

        if (data.countInStock < quantity) {
            window.alert('Sorry! Product is out of stock.');
            return;
        }

        ctxDispatch({ type: 'CART_ADD_ITEM', payload: { ...product, quantity } });
    };

    return (
        <Card className="product" key={product.slug}>
            <Link to={`/product/${product.slug}`}>
                <img src={product.image} className="card-img-top" alt={product.name} />
            </Link>
            <Card.Body>
                <Link to={`/product/${product.slug}`}>
                    <Card.Title>{product.name}</Card.Title>
                </Link>
                <Rating rating={product.rating} numReviews={product.numReviews} />
                <Card.Text>${product.price}</Card.Text>
                {product.countInStock === 0 ? (
                    <Button variant="light" disabled>
                        Out of stock
                    </Button>
                ) : (
                    <Button onClick={() => addToCartHandler(product)}>Add to cart</Button>
                )}
            </Card.Body>
        </Card>
    );
};

export default Product;