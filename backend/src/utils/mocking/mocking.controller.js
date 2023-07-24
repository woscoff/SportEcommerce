import { faker } from '@faker-js/faker'

const createRandomProduct = () => {
    return {
        productId: faker.database.mongodbObjectId(),
        title: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        code: faker.datatype.string(6),
        price: faker.commerce.price(50, 10000),
        status: faker.datatype.boolean(),
        stock: faker.datatype.number({ min: 0, max: 999, precision: 1 }),
        category: faker.commerce.department(),
        thumbnails: faker.image.imageUrl()
    }
}

export const getRandomProducts = async (req, res) => {
    const randomProducts = []
    try {
        for (let i = 0; i < 100; i++) {
            randomProducts.push(createRandomProduct())
        }
        res.status(200).send({
            randomProducts
        })
    } catch (error) {
        console.error(error)
        res.status(500).send({
            message: `Error creating mocking products`,
            error: error
        })
    }
}