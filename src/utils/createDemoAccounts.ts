
import { supabase } from "@/integrations/supabase/client";

export const createDemoAccounts = async () => {
  const demoAccounts = [
    { 
      email: "admin@taskmaster.ai", 
      password: "Admin123!", 
      fullName: "Admin User" 
    },
    { 
      email: "subadmin@taskmaster.ai", 
      password: "SubAdmin123!", 
      fullName: "Sub Admin User" 
    },
    { 
      email: "employee@taskmaster.ai", 
      password: "Employee123!", 
      fullName: "Employee User" 
    },
  ];

  console.log("Creating demo accounts...");

  for (const account of demoAccounts) {
    try {
      const { error } = await supabase.auth.signUp({
        email: account.email,
        password: account.password,
        options: {
          data: {
            full_name: account.fullName,
          },
        },
      });

      if (error && !error.message.includes("User already registered")) {
        console.error(`Failed to create ${account.email}:`, error.message);
      } else {
        console.log(`Demo account ${account.email} created successfully`);
      }
    } catch (err) {
      console.error(`Error creating ${account.email}:`, err);
    }
  }

  console.log("Demo account creation completed");
};
