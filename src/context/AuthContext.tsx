
import React, { createContext, useState, useEffect, useContext } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { subscribeToOwnedCampaignDonations } from '@/services/donationService';

type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Set up donation notifications
  useEffect(() => {
    let cleanupSubscription: () => void = () => {};
    
    if (user) {
      cleanupSubscription = subscribeToOwnedCampaignDonations(user.id, (donation) => {
        // Show donation notification
        const campaignTitle = donation.campaigns?.title || 'your campaign';
        const donorName = donation.is_anonymous ? 
          'Anonymous' : (donation.profiles?.full_name || 'Someone');
        const amount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(donation.amount);
        
        toast.success(`New donation received!`, {
          description: `${donorName} donated ${amount} to ${campaignTitle}`
        });
      });
    }
    
    return () => {
      cleanupSubscription();
    };
  }, [user?.id]);

  useEffect(() => {
    // Set up auth state listener first
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setIsLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data: signUpData, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName, // stored in auth.users.user_metadata
          },
        },
      });
  
      if (error) throw error;
  
      const user = signUpData.user;
  
      if (user) {
        // Check if profile already exists
        const { data: profile, error: fetchError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
  
        if (fetchError && fetchError.code === 'PGRST116') {
          // No profile found — insert a new one
          const { error: insertError } = await supabase.from('profiles').insert({
            id: user.id,
            full_name: fullName,
            email: user.email,
          });
  
          if (insertError) throw insertError;
        } else if (!fetchError && profile?.full_name === null) {
          // Profile exists but full_name is null — update it
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', user.id);
  
          if (updateError) throw updateError;
        }
      }
  
      toast.success("Account created", {
        description: "Please check your email for confirmation"
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "An error occurred during sign up"
      });
      throw error;
    }
  };
  

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
  
      if (error) throw error;
  
      const user = data.user;
      const fullName = user?.user_metadata?.full_name;
  
      if (user && fullName) {
        // Check if full_name is null in profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single();
  
        if (!profileError && profile?.full_name === null) {
          // Update full_name only if it's currently null
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ full_name: fullName })
            .eq('id', user.id);
  
          if (updateError) throw updateError;
        }
      }
  
      toast.success("Welcome back!", {
        description: "You have successfully signed in"
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "An error occurred during sign in"
      });
      throw error;
    }
  };
  

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success("Signed out", {
        description: "You have successfully signed out"
      });
    } catch (error: any) {
      toast.error("Error", {
        description: error.message || "An error occurred during sign out"
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
