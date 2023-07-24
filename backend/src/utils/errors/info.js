export const generateProductErrorInfo = (product) => {
    return `One or more properties were incomplete or not valid.
    Properties of PRODUCT:
        * title         : (required) string, received ${typeof product.title}
        * description   : (required) string, received ${typeof product.description}
        * code          : (required) string, received ${typeof product.code}
        * price         : (required) number, received ${typeof product.number}
        * stock         : (required) number, received ${typeof product.stock}
        * category      : (required) string, received ${typeof product.category}
        * thumbnails    : array, received ${typeof product.thumbnails}`
}