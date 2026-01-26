import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface DeleteUserRequest {
  user_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the requesting user is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      throw new Error("Missing authorization header");
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create client with user's token to verify they're an admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: { Authorization: authHeader },
      },
    });

    const { data: { user: requestingUser }, error: authError } = await userClient.auth.getUser();
    if (authError || !requestingUser) {
      throw new Error("Unauthorized");
    }

    // Check if requesting user is an admin
    const { data: userRole, error: roleError } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", requestingUser.id)
      .eq("role", "admin")
      .maybeSingle();

    if (roleError || !userRole) {
      throw new Error("Only admins can delete users");
    }

    // Get the user_id to delete from request body
    const { user_id }: DeleteUserRequest = await req.json();
    
    if (!user_id) {
      throw new Error("user_id is required");
    }

    // Prevent self-deletion
    if (user_id === requestingUser.id) {
      throw new Error("Cannot delete your own account");
    }

    // Create admin client to delete the user
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // First, delete related data in the correct order
    // 1. Delete user_roles
    await adminClient
      .from("user_roles")
      .delete()
      .eq("user_id", user_id);

    // 2. Delete any invites created by this user
    await adminClient
      .from("contributor_invites")
      .delete()
      .eq("created_by", user_id);

    // 3. Delete the user from auth.users
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(user_id);

    if (deleteError) {
      console.error("Error deleting user:", deleteError);
      throw new Error(`Failed to delete user: ${deleteError.message}`);
    }

    console.log(`User ${user_id} successfully deleted by admin ${requestingUser.id}`);

    return new Response(
      JSON.stringify({ success: true, message: "User deleted successfully" }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in delete-user function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: error.message === "Unauthorized" || error.message === "Only admins can delete users" ? 403 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
