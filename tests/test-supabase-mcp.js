const { createClient } = require('@supabase/supabase-js');

// Track test results
let hasErrors = false;
let totalTests = 0;
let passedTests = 0;

function logTestResult(testName, success, message) {
    totalTests++;
    if (success) {
        passedTests++;
        console.log(`✅ ${testName}: ${message}`);
    } else {
        hasErrors = true;
        console.log(`❌ ${testName}: ${message}`);
    }
}

// Test Supabase MCP Server Configuration
async function testSupabaseMCP() {
    console.log('🔍 Testing Supabase MCP Server Configuration...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL;
    const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    console.log('SUPABASE_URL:', hasUrl ? '✅ SET' : '❌ NOT SET');
    console.log('SUPABASE_ANON_KEY:', hasKey ? '✅ SET' : '❌ NOT SET');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40) + '...');
    console.log('Key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...\n');
    
    logTestResult('Environment Variables', hasUrl && hasKey, hasUrl && hasKey ? 'All required env vars set' : 'Missing required environment variables');
    
    if (!hasUrl || !hasKey) {
        console.log('\n❌ Cannot proceed without environment variables');
        process.exit(1);
    }
    
    // Test Supabase Client Creation
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        console.log('✅ Supabase client created successfully\n');
        logTestResult('Client Creation', true, 'Supabase client created successfully');
        
        // Test basic connection
        console.log('🔗 Testing database connection...');
        const { data, error } = await supabase
            .from('universities')
            .select('count', { count: 'exact', head: true });
            
        if (error) {
            console.log('❌ Database connection failed:');
            console.log('Error code:', error.code);
            console.log('Error message:', error.message);
            console.log('Error details:', error.details);
            console.log('Error hint:', error.hint);
            logTestResult('Database Connection', false, `Connection failed: ${error.message}`);
        } else {
            console.log('✅ Database connection successful!');
            console.log('Universities table accessible');
            logTestResult('Database Connection', true, 'Universities table accessible');
        }
        
        // Test auth connection
        console.log('\n🔐 Testing auth connection...');
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
            console.log('❌ Auth connection failed:', authError.message);
            logTestResult('Auth Connection', false, `Auth failed: ${authError.message}`);
        } else {
            console.log('✅ Auth connection successful');
            console.log('Session exists:', !!authData.session);
            logTestResult('Auth Connection', true, 'Auth connection working');
        }
        
        // Test if tables exist
        console.log('\n📊 Testing table access...');
        const tables = ['universities', 'mba_schools', 'scholarships', 'users'];
        
        for (const table of tables) {
            try {
                const { data, error } = await supabase
                    .from(table)
                    .select('count', { count: 'exact', head: true });
                    
                if (error) {
                    console.log(`❌ Table '${table}':`, error.message);
                    logTestResult(`Table Access: ${table}`, false, error.message);
                } else {
                    console.log(`✅ Table '${table}': accessible`);
                    logTestResult(`Table Access: ${table}`, true, 'Table accessible');
                }
            } catch (err) {
                console.log(`❌ Table '${table}':`, err.message);
                logTestResult(`Table Access: ${table}`, false, err.message);
            }
        }
        
    } catch (error) {
        console.log('❌ Failed to create Supabase client:', error.message);
        logTestResult('Client Creation', false, `Failed to create client: ${error.message}`);
    }
    
    // Print final results
    console.log('\n🎯 Test Summary:');
    console.log(`📊 Total Tests: ${totalTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${totalTests - passedTests}`);
    
    if (hasErrors) {
        console.log('\n❌ Some tests failed! Check configuration and try again.');
        process.exit(1);
    } else {
        console.log('\n✅ All Supabase MCP tests passed!');
        console.log('🎉 Your Supabase configuration is working correctly.');
        process.exit(0);
    }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testSupabaseMCP().catch((error) => {
    console.error('❌ Test suite crashed:', error.message);
    process.exit(1);
});