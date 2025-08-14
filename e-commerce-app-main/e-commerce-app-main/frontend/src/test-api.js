// Simple API test function for debugging
export const testAPI = async () => {
    console.log('🧪 Testing API connectivity...');

    try {
        // Test basic connectivity
        console.log('📡 Testing API endpoint...');
        const apiResponse = await fetch('https://e-commerce-app-fpo8.onrender.com/api/product', {
            method: 'GET',
            mode: 'cors'
        });
        console.log('✅ API Response:', apiResponse.status, apiResponse.statusText);

        if (apiResponse.ok) {
            const data = await apiResponse.json();
            console.log('📦 API Data:', data);
            return { success: true, data };
        } else {
            throw new Error(`HTTP ${apiResponse.status}: ${apiResponse.statusText}`);
        }
    } catch (error) {
        console.error('❌ API Test failed:', error);
        return { success: false, error: error.message };
    }
};

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
    window.testAPI = testAPI;
}
