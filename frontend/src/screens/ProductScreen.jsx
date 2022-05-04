import { useParams } from "react-router-dom";

const ProductScreen = () => {
    const params = useParams();
    const {slug} = params;
    console.log(slug)

    return(
        <h1>
          {slug}  
        </h1>
    );
};

export default ProductScreen;