const express = require('express');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const BASE_URL = 'http://20.244.56.144/test';

const generateUniqueId = (product, index) => {
    return `${product.productName.replace(/\s+/g, '-').toLowerCase()}-${index}`;
};

// Functn to fetch prods from the testing server
const fetchProducts = async (company, category, n, minPrice, maxPrice) => {
    const url = `${BASE_URL}/companies/${company}/categories/${category}/products/top-${n}minPrice-${minPrice}maxPrice-${maxPrice}`;
    console.log(`Fetching URL: ${url}`); // Log the URL being fetched
    const response = await axios.get(url);
    return response.data;
};

// Endpoint for top n prods in a category
app.get('/categories/:categoryname/products', async (req, res) => {
    const { categoryname } = req.params;
    const { n = 10, page = 1, sort, minPrice = 0, maxPrice = 1000000 } = req.query;

    const companies = ['AZ', 'FLP', 'SNP', 'MYN', 'AZO'];

    try {
        let products = [];

        for (const company of companies) {
            const companyProducts = await fetchProducts(company, categoryname, n, minPrice, maxPrice);
            companyProducts.forEach((product, index) => {
                product.id = generateUniqueId(product, index);
                product.company = company;
            });
            products = products.concat(companyProducts);
        }

        // Sort logic
        if (sort) {
            const [sortKey, sortOrder] = sort.split(':');
            products.sort((a, b) => {
                if (sortOrder === 'desc') {
                    return b[sortKey] - a[sortKey];
                } else {
                    return a[sortKey] - b[sortKey];
                }
            });
        }

        // Pagination logic
        const pageSize = parseInt(n);
        const paginatedProducts = products.slice((page - 1) * pageSize, page * pageSize);

        res.json(paginatedProducts);
    } catch (error) {
        console.error('Error fetching products:', error.message); // Log the error
        res.status(500).json({ message: 'Error fetching products', error: error.message });
    }
});

// Endpoint to get details of a specific product
app.get('/categories/:categoryname/products/:productid', (req, res) => {
    const { categoryname, productid } = req.params;
    res.json({ message: 'Product details endpoint', categoryname, productid });
});

// server start
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});