import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CreateUserRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  department?: string;
  job_title?: string;
  role_id: string;
  status: string;
  avatar_url?: string | null;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    console.log('=== CREATE USER FUNCTION STARTED ===');
    
    // Only allow POST requests
    if (req.method !== 'POST') {
      console.log('Invalid method:', req.method);
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { 
          status: 405, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('Missing authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Initialize Supabase clients
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');

    console.log('Environment check:', {
      hasUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasAnonKey: !!supabaseAnonKey
    });

    if (!supabaseUrl || !supabaseServiceKey || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);

    // Verify the user making the request is authenticated
    const token = authHeader.replace('Bearer ', '');
    console.log('Verifying auth token...');
    
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);

    if (authError || !user) {
      console.error('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('Authenticated user:', user.id);

    // Parse request body
    const userData: CreateUserRequest = await req.json();
    console.log('Request data received for email:', userData.email);

    // Normalize email to lowercase and trim whitespace
    const normalizedEmail = userData.email.toLowerCase().trim();
    console.log('Normalized email:', normalizedEmail);

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      console.log('Invalid email format:', normalizedEmail);
      return new Response(
        JSON.stringify({ error: 'Please enter a valid email address' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate required fields
    if (!normalizedEmail || !userData.password || !userData.first_name || 
        !userData.last_name || !userData.role_id) {
      console.log('Missing required fields');
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Validate password strength
    if (userData.password.length < 6) {
      console.log('Password too short');
      return new Response(
        JSON.stringify({ error: 'Password must be at least 6 characters long' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('=== CHECKING FOR EXISTING USERS ===');

    // Check if email already exists in user_profiles
    console.log('Checking user_profiles for existing email...');
    const { data: existingProfiles, error: profileCheckError } = await supabaseAdmin
      .from('user_profiles')
      .select('email, user_id')
      .ilike('email', normalizedEmail);

    if (profileCheckError) {
      console.error('Error checking profiles:', profileCheckError);
      return new Response(
        JSON.stringify({ error: 'Error checking existing profiles' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    if (existingProfiles && existingProfiles.length > 0) {
      console.log('Profile already exists - real conflict');
      return new Response(
        JSON.stringify({ error: 'A user with this email already exists' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('=== ATTEMPTING DIRECT AUTH USER CREATION ===');

    // Try multiple approaches to create the user
    let authData = null;
    let createAuthError = null;

    // Approach 1: Standard admin.createUser
    console.log('Approach 1: Standard admin.createUser');
    try {
      const result = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password: userData.password,
        email_confirm: true,
        user_metadata: {
          first_name: userData.first_name,
          last_name: userData.last_name
        }
      });
      
      if (result.data?.user && !result.error) {
        authData = result.data;
        console.log('Approach 1 succeeded');
      } else {
        createAuthError = result.error;
        console.log('Approach 1 failed:', result.error?.message);
      }
    } catch (error) {
      createAuthError = error;
      console.log('Approach 1 exception:', error.message);
    }

    // Approach 2: If approach 1 failed, try with different parameters
    if (!authData && createAuthError) {
      console.log('Approach 2: Simplified createUser');
      try {
        const result = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: userData.password,
          email_confirm: true
        });
        
        if (result.data?.user && !result.error) {
          authData = result.data;
          console.log('Approach 2 succeeded');
        } else {
          console.log('Approach 2 failed:', result.error?.message);
        }
      } catch (error) {
        console.log('Approach 2 exception:', error.message);
      }
    }

    // Approach 3: If both failed, try using signUp instead
    if (!authData && createAuthError) {
      console.log('Approach 3: Using signUp method');
      try {
        const result = await supabaseAdmin.auth.signUp({
          email: normalizedEmail,
          password: userData.password,
          options: {
            emailRedirectTo: undefined,
            data: {
              first_name: userData.first_name,
              last_name: userData.last_name
            }
          }
        });
        
        if (result.data?.user && !result.error) {
          authData = result.data;
          console.log('Approach 3 succeeded');
        } else {
          console.log('Approach 3 failed:', result.error?.message);
        }
      } catch (error) {
        console.log('Approach 3 exception:', error.message);
      }
    }

    // If all approaches failed, return error
    if (!authData) {
      console.error('All auth creation approaches failed');
      
      // Handle specific auth errors
      if (createAuthError?.message.includes('already registered') || 
          createAuthError?.message.includes('already exists') ||
          createAuthError?.message.includes('duplicate') ||
          createAuthError?.message.includes('User already registered')) {
        
        console.log('Auth says user exists - checking for orphaned users');
        
        // Try to find and clean up orphaned auth users
        try {
          const { data: allAuthUsers } = await supabaseAdmin.auth.admin.listUsers();
          const conflictingUsers = allAuthUsers?.users.filter(u => 
            u.email?.toLowerCase().trim() === normalizedEmail
          ) || [];
          
          console.log(`Found ${conflictingUsers.length} conflicting auth users`);
          
          for (const conflictUser of conflictingUsers) {
            // Check if this user has a profile
            const { data: userProfile } = await supabaseAdmin
              .from('user_profiles')
              .select('id')
              .eq('user_id', conflictUser.id)
              .maybeSingle();
            
            if (!userProfile) {
              console.log(`Deleting orphaned auth user: ${conflictUser.id}`);
              await supabaseAdmin.auth.admin.deleteUser(conflictUser.id);
            }
          }
          
          // Wait and try one more time
          await new Promise(resolve => setTimeout(resolve, 2000));
          
          const retryResult = await supabaseAdmin.auth.admin.createUser({
            email: normalizedEmail,
            password: userData.password,
            email_confirm: true
          });
          
          if (retryResult.data?.user && !retryResult.error) {
            authData = retryResult.data;
            console.log('Retry after cleanup succeeded');
          }
        } catch (cleanupError) {
          console.error('Cleanup failed:', cleanupError);
        }
      }
      
      if (!authData) {
        return new Response(
          JSON.stringify({ 
            error: createAuthError?.message || 'Failed to create user account'
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
    }

    if (!authData?.user) {
      console.error('No user data returned from auth creation');
      return new Response(
        JSON.stringify({ error: 'Failed to create user - no user data returned' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log(`Auth user created successfully: ${authData.user.id}`);

    // Create user profile
    console.log('Creating user profile...');
    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert([{
        user_id: authData.user.id,
        email: normalizedEmail,
        first_name: userData.first_name,
        last_name: userData.last_name,
        phone: userData.phone || null,
        department: userData.department || null,
        job_title: userData.job_title || null,
        role_id: userData.role_id,
        status: userData.status,
        avatar_url: userData.avatar_url || null
      }]);

    if (profileError) {
      console.error('Profile creation failed:', profileError);
      
      // Clean up the auth user if profile creation fails
      console.log('Cleaning up auth user due to profile failure...');
      try {
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
        console.log('Auth user cleanup successful');
      } catch (cleanupError) {
        console.error('Failed to cleanup auth user:', cleanupError);
      }
      
      // Handle unique constraint violation for email
      if (profileError.code === '23505' && profileError.message.includes('user_profiles_email_key')) {
        return new Response(
          JSON.stringify({ 
            error: 'A user with this email already exists. Please use a different email.' 
          }),
          { 
            status: 400, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ 
          error: `Failed to create user profile: ${profileError.message}` 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    console.log('=== USER CREATION COMPLETED SUCCESSFULLY ===');
    console.log(`Created user: ${normalizedEmail} with ID: ${authData.user.id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        user: {
          id: authData.user.id,
          email: authData.user.email
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('=== UNEXPECTED ERROR ===');
    console.error('Error details:', error);
    console.error('Error stack:', error.stack);
    
    return new Response(
      JSON.stringify({ 
        error: 'An unexpected error occurred while creating the user',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});