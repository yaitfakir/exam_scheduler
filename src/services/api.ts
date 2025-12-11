import { supabase } from "@/integrations/supabase/client";

export const api = {
  // Professors
  professors: {
    getAll: async () => {
      const { data, error } = await supabase
        .from("professors")
        .select("*")
        .order("first_name");
      if (error) throw error;
      return data;
    },
    create: async (professor: {
      first_name: string;
      last_name: string;
      email?: string;
      phone?: string;
      department?: string;
    }) => {
      const { data, error } = await supabase
        .from("professors")
        .insert(professor)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (
      id: number,
      updates: Partial<{
        name: string;
        email: string;
        phone: string;
        department: string;
      }>
    ) => {
      const { data, error } = await supabase
        .from("professors")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from("professors").delete().eq("id", id);
      if (error) throw error;
    },
  },

  // Rooms
  rooms: {
    getAll: async () => {
      const { data, error } = await supabase
        .from("rooms")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
    create: async (room: {
      name: string;
      capacity: number;
      type: string;
      equipment: string[];
    }) => {
      const { data, error } = await supabase
        .from("rooms")
        .insert(room)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: number, updates: any) => {
      const { data, error } = await supabase
        .from("rooms")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from("rooms").delete().eq("id", id);
      if (error) throw error;
    },
  },

  // Modules
  modules: {
    getAll: async () => {
      const { data, error } = await supabase
        .from("modules")
        .select(
          `
                    *,
                    professor:professors(first_name)
                `
        )
        .order("name");
      if (error) throw error;
      // Transformation to match UI expectation if needed (flattening professor name)
      return data.map((m) => ({
        ...m,
        professor: m.professor?.first_name || "Non assigné",
      }));
    },
    create: async (module: any) => {
      // we expect module to contain professor_id if it was selected from dropdown
      const { data, error } = await supabase
        .from("modules")
        .insert(module)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: number, updates: any) => {
      const { data, error } = await supabase
        .from("modules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from("modules").delete().eq("id", id);
      if (error) throw error;
    },
  },

  // Exams
  exams: {
    getAll: async () => {
      const { data, error } = await supabase
        .from("exams")
        .select(
          `
                    *,
                    module:modules(name, code),
                    room:rooms(name),
                    supervisor:professors(first_name)
                `
        )
        .order("date");
      if (error) throw error;

      // Transform for UI
      return data.map((e) => ({
        ...e,
        module: e.module?.name,
        code: e.module?.code,
        room: e.room?.name || "Non assignée",
        supervisor: e.supervisor?.first_name || "Non assigné",
        // Calculate display format if needed, though DB fields should suffice
      }));
    },
    create: async (exam: any) => {
      const { data, error } = await supabase
        .from("exams")
        .insert(exam)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: number, updates: any) => {
      const { data, error } = await supabase
        .from("exams")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from("exams").delete().eq("id", id);
      if (error) throw error;
    },
  },

  // Events
  events: {
    getAll: async () => {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .order("date");
      if (error) throw error;
      return data.map((e) => {
        let details = { room: "", duration: 0, color: "bg-primary" };
        try {
          if (e.description && e.description.startsWith("{")) {
            details = JSON.parse(e.description);
          } else {
            details.room = e.description || "";
          }
        } catch {
          details.room = e.description || "";
        }

        const dateObj = new Date(e.date);
        const timeStr = dateObj.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return {
          ...e,
          time: timeStr,
          room: details.room,
          duration: details.duration || 60,
          color: details.color || "bg-primary",
        };
      });
    },
    create: async (event: any) => {
      // event has title, date (Date obj or iso), time (string), duration, room, color, type
      // we need to combine date+time into timestamp, and pack others into description
      const dateStr =
        event.date instanceof Date
          ? event.date.toISOString().split("T")[0]
          : event.date.split("T")[0];
      const dateTime = new Date(`${dateStr}T${event.time}:00`);

      const description = JSON.stringify({
        room: event.room,
        duration: event.duration,
        color: event.color,
      });

      const payload = {
        title: event.title,
        date: dateTime.toISOString(),
        type: event.type,
        description: description,
      };

      const { data, error } = await supabase
        .from("events")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id: number) => {
      const { error } = await supabase.from("events").delete().eq("id", id);
      if (error) throw error;
    },
  },
};
