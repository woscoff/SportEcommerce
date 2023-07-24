import { Schema, model } from "mongoose";

const ticketSchema = new Schema({
    code: {
        type: Number,
        required: true,
        unique: true,
        index: true,
        default: () => { return new Date().valueOf() }
    },
    purchase_datetime: {
        type: Date,
        default: Date.now
    },
    total_amount: {
        type: Number,
        required: true
    },
    purchaser: {
        type: String,
        required: true
    }
})

const ticketModel = model("tickets", ticketSchema)
export default ticketModel