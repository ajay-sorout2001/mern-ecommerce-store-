const axios = require('axios');

const API_BASE_URL = 'http://localhost:3000/api';

// Authentication tokens for each seller
const sellerTokens = {
    atomberg: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODljY2IyYzk4NmI4ODQ4MGY3OTY0MGMiLCJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzU1MTA2MzIwLCJleHAiOjE3NTUxOTI3MjB9.9wbwRFHUqXXQ9PRtrp2MtZgMBHfz2-ZD9vNPQDUxx7o',
    bajaj: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODljY2IzMDk4NmI4ODQ4MGY3OTY0MjMiLCJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzU1MTA2MzE5LCJleHAiOjE3NTUxOTI3MTl9.Temdc66n-zzhtglG-gY5VkHE58KCbQs1ycPcA-YeYrM',
    phillips: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODljY2IzOTk4NmI4ODQ4MGY3OTY0NDYiLCJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzU1MTA2MzIwLCJleHAiOjE3NTUxOTI3MjB9.VXGLJG5B8ZGVoLw0lLDsoa5kzVgmx4LinOXhnJpBER0',
    tata: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODljY2IzZTk4NmI4ODQ4MGY3OTY0NWQiLCJyb2xlIjoic2VsbGVyIiwiaWF0IjoxNzU1MTA2MzIwLCJleHAiOjE3NTUxOTI3MjB9.dNUtPVHgUm6FnpW5HJdOKRWtsg3vc2dh1cTaDSY6BK0'
};

// Product category mappings - mapping product ID to correct category and seller
const categoryUpdates = {
    // Atomberg products
    '689ccb2c986b88480f796410': { title: 'Fan', newCategory: 'electronics', seller: 'atomberg' },
    '689ccb2d986b88480f796416': { title: 'Mixer Grinder', newCategory: 'home', seller: 'atomberg' },
    '689ccb2f986b88480f79641c': { title: 'Smart Lock', newCategory: 'electronics', seller: 'atomberg' },

    // Bajaj products
    '689ccb31986b88480f796427': { title: 'Ceiling Fan', newCategory: 'electronics', seller: 'bajaj' },
    '689ccb32986b88480f79642d': { title: 'LED Bulb', newCategory: 'electronics', seller: 'bajaj' },
    '689ccb34986b88480f796433': { title: 'Mixer Grinder', newCategory: 'home', seller: 'bajaj' },
    '689ccb37986b88480f79643f': { title: 'Water Heater', newCategory: 'electronics', seller: 'bajaj' },

    // Phillips products
    '689ccb39986b88480f79644a': { title: 'Hair Dryer', newCategory: 'beauty', seller: 'phillips' },
    '689ccb3c986b88480f796456': { title: 'Steam Iron', newCategory: 'electronics', seller: 'phillips' },

    // Tata products
    '689ccb3e986b88480f796461': { title: 'Salt Lite', newCategory: 'grocery', seller: 'tata' },
    '689ccb40986b88480f796467': { title: 'Salt', newCategory: 'grocery', seller: 'tata' },
    '689ccb41986b88480f79646d': { title: 'Tea', newCategory: 'grocery', seller: 'tata' },
    '689ccb43986b88480f796473': { title: 'Water Purifier', newCategory: 'electronics', seller: 'tata' },
};

async function updateProductCategory(productId, newCategory, title, seller) {
    try {
        const token = sellerTokens[seller];
        if (!token) {
            console.log(`❌ No token found for seller: ${seller}`);
            return false;
        }

        const response = await axios.patch(
            `${API_BASE_URL}/product/${productId}`,
            { category: newCategory },
            {
                headers: {
                    'Cookie': `authToken=${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data.success) {
            console.log(`✅ Updated "${title}" (${productId}) → ${newCategory} [${seller}]`);
            return true;
        } else {
            console.log(`❌ Failed to update "${title}": ${response.data.message}`);
            return false;
        }
    } catch (error) {
        console.log(`❌ Error updating "${title}": ${error.response?.data?.message || error.message}`);
        return false;
    }
}

async function patchAllCategories() {
    console.log('🚀 Starting category updates...\n');

    let successful = 0;
    let failed = 0;

    for (const [productId, { title, newCategory, seller }] of Object.entries(categoryUpdates)) {
        const result = await updateProductCategory(productId, newCategory, title, seller);
        if (result) {
            successful++;
        } else {
            failed++;
        }

        // Add a small delay to avoid overwhelming the server
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log(`\n📊 Summary:`);
    console.log(`✅ Successfully updated: ${successful} products`);
    console.log(`❌ Failed updates: ${failed} products`);

    if (failed === 0) {
        console.log('🎉 All categories have been updated successfully!');
    }
}

// Run the patch script
patchAllCategories().catch(console.error);
