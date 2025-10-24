// Using built-in fetch (Node.js 18+)

const BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
    console.log('🧪 Testing PrepSync API endpoints...\n');
    
    try {
        // Test health endpoint
        console.log('1. Testing health endpoint...');
        const healthResponse = await fetch(`${BASE_URL}/health`);
        const healthData = await healthResponse.json();
        console.log('✅ Health check:', healthData.message);
        
        // Test registration
        console.log('\n2. Testing user registration...');
        const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                username: 'testuser',
                email: 'test@example.com',
                password: 'testpassword123'
            })
        });
        const registerData = await registerResponse.json();
        
        if (registerData.success) {
            console.log('✅ Registration successful:', registerData.data.user.username);
            const token = registerData.data.token;
            
            // Test login
            console.log('\n3. Testing user login...');
            const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: 'test@example.com',
                    password: 'testpassword123'
                })
            });
            const loginData = await loginResponse.json();
            
            if (loginData.success) {
                console.log('✅ Login successful:', loginData.data.user.username);
                
                // Test protected route - get recipes
                console.log('\n4. Testing protected route - get recipes...');
                const recipesResponse = await fetch(`${BASE_URL}/recipes`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const recipesData = await recipesResponse.json();
                
                if (recipesData.success) {
                    console.log('✅ Protected route working:', `Found ${recipesData.data.recipes.length} recipes`);
                    
                    // Test create recipe
                    console.log('\n5. Testing recipe creation...');
                    const createRecipeResponse = await fetch(`${BASE_URL}/recipes`, {
                        method: 'POST',
                        headers: { 
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                            name: 'Test Recipe',
                            description: 'A test recipe',
                            category: 'test',
                            prep_time: 15,
                            cook_time: 30,
                            servings: 4,
                            difficulty: 'Easy',
                            ingredients: ['1 cup flour', '2 eggs', '1 cup milk'],
                            instructions: ['Mix ingredients', 'Cook for 30 minutes', 'Serve hot'],
                            notes: 'This is a test recipe'
                        })
                    });
                    const createRecipeData = await createRecipeResponse.json();
                    
                    if (createRecipeData.success) {
                        console.log('✅ Recipe creation successful:', createRecipeData.data.recipe.name);
                        console.log('\n🎉 All API tests passed!');
                    } else {
                        console.log('❌ Recipe creation failed:', createRecipeData.message);
                    }
                } else {
                    console.log('❌ Protected route failed:', recipesData.message);
                }
            } else {
                console.log('❌ Login failed:', loginData.message);
            }
        } else {
            console.log('❌ Registration failed:', registerData.message);
        }
        
    } catch (error) {
        console.error('❌ API test failed:', error.message);
    }
}

// Run if called directly
if (require.main === module) {
    testAPI();
}

module.exports = { testAPI };
