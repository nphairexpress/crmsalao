import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  salonId: string | null;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    salonName: string
  ) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  createSalonForCurrentUser: (fullName: string, salonName: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [salonId, setSalonId] = useState<string | null>(null);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer fetching salon ID to avoid deadlock
        if (session?.user) {
          setTimeout(() => {
            fetchUserSalonId(session.user.id);
          }, 0);
        } else {
          setSalonId(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserSalonId(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserSalonId = async (userId: string) => {
    const { data } = await supabase
      .from("profiles")
      .select("salon_id")
      .eq("user_id", userId)
      .maybeSingle();
    
    if (data?.salon_id) {
      setSalonId(data.salon_id);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const createSalonForCurrentUser = async (fullName: string, salonName: string) => {
    if (!user) return { error: new Error("Usuário não autenticado") };

    // Create salon
    const { data: salonData, error: salonError } = await supabase
      .from("salons")
      .insert({ name: salonName })
      .select()
      .single();

    if (salonError) return { error: salonError as Error };

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: user.id,
        salon_id: salonData.id,
        full_name: fullName,
      });

    if (profileError) return { error: profileError as Error };

    // Create admin role
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: user.id,
        salon_id: salonData.id,
        role: "admin",
      });

    if (roleError) return { error: roleError as Error };

    setSalonId(salonData.id);
    return { error: null };
  };

  const signUp = async (email: string, password: string, fullName: string, salonName: string) => {
    const redirectUrl = `${window.location.origin}/`;

    // Create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (authError) return { error: authError as Error };
    if (!authData.user) return { error: new Error("Erro ao criar usuário") };

    // Create salon
    const { data: salonData, error: salonError } = await supabase
      .from("salons")
      .insert({ name: salonName })
      .select()
      .single();

    if (salonError) return { error: salonError as Error };

    // Create profile
    const { error: profileError } = await supabase
      .from("profiles")
      .insert({
        user_id: authData.user.id,
        salon_id: salonData.id,
        full_name: fullName,
      });

    if (profileError) return { error: profileError as Error };

    // Create admin role for user
    const { error: roleError } = await supabase
      .from("user_roles")
      .insert({
        user_id: authData.user.id,
        salon_id: salonData.id,
        role: "admin",
      });

    if (roleError) return { error: roleError as Error };

    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setSalonId(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, salonId, signIn, signUp, signOut, createSalonForCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
