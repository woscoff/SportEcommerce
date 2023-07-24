import cartModel from "../models/MongoDB/cartModel.js";

export const findCartById = async (id) => {
    try {
        return await cartModel.findById(id);
    } catch (error) {
        throw new Error(error);
    }
}

export const createCart = async () => {
    try {
        const newCart = await cartModel()
        await newCart.save()
        return newCart
    } catch (error) {
        throw new Error(error);
    }
}

export const deleteCart = async (id) => {
    try {
        return await cartModel.findByIdAndDelete(id);
    } catch (error) {
        throw new Error(error);
    }
}

export const updateCart = async (id, info) => {
    try {
        return await cartModel.findByIdAndUpdate(id, info);
    } catch (error) {
        throw new Error(error);
    }
}

export const changeProductQuantity = async (cartID, productID, newQty) => {
    try {
        const cart = await findCartById(cartID)
        if (!cart) {
            throw new Error('Cart not found')
        }

        const productIndex = cart.products.findIndex(product => product.productId.equals(productID))
        if (productIndex === -1) {
            throw new Error('Product not found in the specified cart')
        }

        cart.products[productIndex].quantity = newQty
        await cart.save()
        return cart
    } catch (error) {
        throw new Error(error)
    }
}

export const removeFromCart = async (cartID, productID) => {
    try {
        const cart = await findCartById(cartID)
        const productIndex = cart.products.findIndex(product => product.productId.equals(productID))

        if (productIndex === -1) {
            throw new Error(`Product not found in the specified cart`)
        } else {
            cart.products.splice(productIndex, 1)
            await cart.save()
            return true
        }
    } catch (error) {
        throw new Error(error)
    }
}