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
      first_name?: string;
      last_name?: string;
      name?: string;
      email?: string;
      phone?: string;
      department?: string;
      department_id?: string | null;
    }) => {
      let first_name = professor.first_name?.trim();
      let last_name = professor.last_name?.trim();
      if ((!first_name || !last_name) && professor.name) {
        const parts = String(professor.name).trim().split(/\s+/);
        first_name = first_name || parts.shift() || "";
        last_name = last_name || parts.join(" ");
      }

      let department_id: string | null = professor.department_id ?? null;
      if (!department_id && professor.department) {
        const { data: dept } = await supabase
          .from("departments")
          .select("id")
          .eq("name", professor.department)
          .limit(1);
        if (dept && dept.length > 0) {
          department_id = dept[0].id as string;
        }
      }

      const payload = {
        first_name,
        last_name,
        email: professor.email,
        phone: professor.phone,
        department_id,
      } as const;

      const { data, error } = await supabase
        .from("professors")
        .insert(payload as any)
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
        name: string;
        email: string;
        phone: string;
        department: string;
        department_id: string | null;
      }>
    ) => {
      let first_name = updates.first_name;
      let last_name = updates.last_name;
      if (updates.name) {
        const parts = String(updates.name).trim().split(/\s+/);
        first_name = parts.shift() || first_name;
        last_name = parts.join(" ") || last_name;
      }

      let department_id: string | null | undefined = updates.department_id;
      if (updates.department !== undefined && department_id === undefined) {
        if (updates.department) {
          const { data: dept } = await supabase
            .from("departments")
            .select("id")
            .eq("name", updates.department)
            .limit(1);
          department_id = dept && dept.length > 0 ? (dept[0].id as string) : null;
        } else {
          department_id = null;
        }
      }

      const payload: Record<string, unknown> = {
        ...(first_name !== undefined && { first_name }),
        ...(last_name !== undefined && { last_name }),
        ...(updates.email !== undefined && { email: updates.email }),
        ...(updates.phone !== undefined && { phone: updates.phone }),
        ...(department_id !== undefined && { department_id }),
      };

      const { data, error } = await supabase
        .from("professors")
        .update(payload as any)
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
      return (data || []).map((r: any) => ({
        ...r,
        type:
          r.room_type === "auditorium"
            ? "Amphithéâtre"
            : r.room_type === "lab"
            ? "Salle TP"
            : "Salle TD",
        equipment: [
          ...(r.has_computers ? ["Ordinateurs"] : []),
          ...(r.has_projector ? ["Vidéoprojecteur"] : []),
        ],
      }));
    },
    create: async (room: {
      name: string;
      capacity: number | string;
      type?: string | null;
      equipment?: string[] | null;
    }) => {
      const payload = {
        name: String(room.name || "").trim(),
        capacity: Number(room.capacity || 0),
      };

      const { data, error } = await supabase
        .from("rooms")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, updates: any) => {
      const payload: any = {
        ...(updates.name !== undefined && { name: updates.name }),
        ...(updates.capacity !== undefined && { capacity: updates.capacity }),
        ...(updates.building !== undefined && { building: updates.building }),
      };
      if (updates.type !== undefined) {
        payload.room_type = updates.type === "Amphithéâtre" ? "auditorium" : updates.type === "Salle TP" || updates.type === "Laboratoire" ? "lab" : "classroom";
      }
      if (updates.equipment !== undefined) {
        payload.has_computers = !!updates.equipment?.includes("Ordinateurs");
        payload.has_projector = !!updates.equipment?.includes("Vidéoprojecteur");
      }

      const { data, error } = await supabase
        .from("rooms")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
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
                    professor:professors(first_name,last_name)
                `
        )
        .order("name");
      if (error) throw error;
      return data.map((m) => ({
        ...m,
        professor: m.professor?.first_name || "Non assigné",
      }));
    },
    create: async (module: any) => {
      const code = String(module.code || "").toUpperCase();
      const { data: existing, error: fetchError } = await supabase
        .from("modules")
        .select("*")
        .eq("code", code)
        .maybeSingle();
      if (fetchError) throw fetchError;

      if (existing) {
        const updates = {
          name: module.name ?? existing.name,
          semester: module.semester ?? existing.semester,
          credits: module.credits ?? existing.credits,
          professor_id:
            module.professor_id !== null && module.professor_id !== undefined
              ? module.professor_id
              : existing.professor_id,
        };
        const { data, error } = await supabase
          .from("modules")
          .update(updates)
          .eq("id", existing.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      } else {
        const payload = { ...module, code };
        const { data, error } = await supabase
          .from("modules")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    },
    update: async (id: string, updates: any) => {
      const { data, error } = await supabase
        .from("modules")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
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
                    supervisor:professors(first_name,last_name)
                `
        )
        .order("date");
      if (error) throw error;

      return data.map((e) => ({
        ...e,
        module: e.module?.name,
        code: e.module?.code,
        room: e.room?.name || "Non assignée",
        supervisor: e.supervisor?.first_name || "Non assigné",
      }));
    },
    create: async (exam: any) => {
      const start = String(exam.time || "");
      const durationMin = Math.round(Number(exam.duration || 0) * 60);
      let end: string | undefined;
      if (start && durationMin) {
        const [h, m] = start.split(":").map((x: string) => parseInt(x, 10));
        const total = h * 60 + m + durationMin;
        const eh = Math.floor((total % (24 * 60)) / 60)
          .toString()
          .padStart(2, "0");
        const em = Math.floor(total % 60)
          .toString()
          .padStart(2, "0");
        end = `${eh}:${em}`;
      }

      const payload: any = {
        module_id: exam.module_id,
        room_id: exam.room_id ?? null,
        date: exam.date,
        start_time: start || null,
        end_time: end || null,
        duration_minutes: durationMin || null,
        status: exam.status,
      };
      if (exam.supervisor_id !== undefined) {
        payload.professor_id = exam.supervisor_id;
      }

      const { data, error } = await supabase
        .from("exams")
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    update: async (id: string, updates: any) => {
      const start = updates.time ? String(updates.time) : updates.start_time;
      const durationMin = updates.duration_minutes ?? (updates.duration ? Math.round(Number(updates.duration) * 60) : undefined);
      let end: string | undefined = updates.end_time;
      if (!end && start && durationMin) {
        const [h, m] = start.split(":").map((x: string) => parseInt(x, 10));
        const total = h * 60 + m + durationMin;
        const eh = Math.floor((total % (24 * 60)) / 60)
          .toString()
          .padStart(2, "0");
        const em = Math.floor(total % 60)
          .toString()
          .padStart(2, "0");
        end = `${eh}:${em}`;
      }

      const payload: any = {
        module_id: updates.module_id,
        room_id: updates.room_id ?? null,
        date: updates.date,
        start_time: start ?? null,
        end_time: end ?? null,
        duration_minutes: durationMin ?? null,
        status: updates.status,
      };
      if (updates.supervisor_id !== undefined) {
        payload.professor_id = updates.supervisor_id;
      }

      const { data, error } = await supabase
        .from("exams")
        .update(payload)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    delete: async (id: string) => {
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
