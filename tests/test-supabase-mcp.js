const { createClient } = require('@supabase/supabase-js');

// Test Supabase MCP Server Configuration
async function testSupabaseMCP() {
    console.log('🔍 Testing Supabase MCP Server Configuration...\n');
    
    // Check environment variables
    console.log('📋 Environment Variables:');
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ SET' : '❌ NOT SET');
    console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ SET' : '❌ NOT SET');
    console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 40) + '...');
    console.log('Key (first 20 chars):', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...\n');
    
    // Test Supabase Client Creation
    try {
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        );
        
        console.log('✅ Supabase client created successfully\n');
        
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
        } else {
            console.log('✅ Database connection successful!');
            console.log('Universities table accessible');
        }
        
        // Test auth connection
        console.log('\n🔐 Testing auth connection...');
        const { data: authData, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
            console.log('❌ Auth connection failed:', authError.message);
        } else {
            console.log('✅ Auth connection successful');
            console.log('Session exists:', !!authData.session);
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
                } else {
                    console.log(`✅ Table '${table}': accessible`);
                }
            } catch (err) {
                console.log(`❌ Table '${table}':`, err.message);
            }
        }
        
    } catch (error) {
        console.log('❌ Failed to create Supabase client:', error.message);
    }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });

testSupabaseMCP().catch(console.error);