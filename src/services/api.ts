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
        .insert({ ...professor, name: `${professor.first_name} ${professor.last_name}` })
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
                    professor:professors(first_name,last_name)
                `
        )
        .order("name");
      if (error) throw error;
      // Compose full name from joined professor
      return data.map((m) => {
        const prof = (m as any).professor as { first_name?: string; last_name?: string } | null | undefined;
        const fullName = prof && (prof.first_name || prof.last_name)
          ? `${prof.first_name ?? ""} ${prof.last_name ?? ""}`.trim()
          : "Non assigné";
        return { ...m, professor: fullName };
      });
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
                    supervisor:professors(first_name,last_name)
                `
        )
        .order("date");
      if (error) throw error;

      // Transform for UI
      return data.map((e) => {
        const sup = (e as any).supervisor as { first_name?: string; last_name?: string } | null | undefined;
        const supName = sup && (sup.first_name || sup.last_name)
          ? `${sup.first_name ?? ""} ${sup.last_name ?? ""}`.trim()
          : "Non assigné";

        const start = (e as any).start_time as string | undefined;
        const durationMin = (e as any).duration_minutes as number | undefined;
        let end: string | undefined = (e as any).end_time as string | undefined;
        if (start && durationMin && !end) {
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

        return {
          ...e,
          module: e.module?.name,
          code: e.module?.code,
          room: e.room?.name || "Non assignée",
          supervisor: supName,
          time: start && end ? `${start} - ${end}` : start || (e as any).time,
          duration: typeof durationMin === "number" ? durationMin / 60 : null,
        };
      });
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
    update: async (id: number, updates: any) => {
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
