import { supabase } from "@/integrations/supabase/client";

export const api = {
  // Professors
  professors: {
    getAll: async () => {
      const { data, error } = await supabase
        .from("professors")
        .select("*, department:departments(name)")
        .order("first_name");
      if (error) throw error;
      return (data || []).map((p: any) => ({
        ...p,
        department: p.department?.name || null,
      }));
    },
    create: async (professor: {
      first_name: string;
      last_name: string;
      email?: string;
      phone?: string;
      department?: string; // department name
    }) => {
      let department_id: string | null = null;
      if (professor.department) {
        const { data: dept, error: deptErr } = await supabase
          .from("departments")
          .select("id")
          .eq("name", professor.department)
          .limit(1);
        if (!deptErr && dept && dept.length > 0) {
          department_id = dept[0].id;
        }
      }

      const payload = {
        first_name: professor.first_name,
        last_name: professor.last_name,
        email: professor.email,
        phone: professor.phone,
        department_id,
      };

      const { data, error } = await supabase
        .from("professors")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (
      id: string,
      updates: Partial<{
        first_name: string;
        last_name: string;
        email: string;
        phone: string;
        department: string; // department name
      }>
    ) => {
      let department_id: string | undefined;
      if (updates.department) {
        const { data: dept, error: deptErr } = await supabase
          .from("departments")
          .select("id")
          .eq("name", updates.department)
          .limit(1);
        if (!deptErr && dept && dept.length > 0) {
          department_id = dept[0].id;
        } else {
          department_id = null as any;
        }
      }

      const payload: any = {
        ...(updates.first_name !== undefined && { first_name: updates.first_name }),
        ...(updates.last_name !== undefined && { last_name: updates.last_name }),
        ...(updates.email !== undefined && { email: updates.email }),
        ...(updates.phone !== undefined && { phone: updates.phone }),
        ...(updates.department !== undefined && { department_id }),
      };

      const { data, error } = await supabase
        .from("professors")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
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
