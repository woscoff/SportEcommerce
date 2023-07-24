import { Schema, model } from "mongoose";

const cartSchema = new Schema({
    products: {
        type: [{
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'products',
                required: true
            },
            quantity: {
                type: Number,
                default: 1
            }
        }],
        default: []
    }
})

const cartModel = model("carts", cartSchema)

export default cartModel