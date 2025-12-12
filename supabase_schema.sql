CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TYPE public.exam_status AS ENUM ('scheduled','completed','cancelled');
CREATE TYPE public.room_type AS ENUM ('classroom','lab','auditorium');
CREATE TYPE public.surveillance_status AS ENUM ('assigned','completed','cancelled');
CREATE TYPE public.day_of_week AS ENUM ('monday','tuesday','wednesday','thursday','friday','saturday','sunday');

CREATE TABLE public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id)
);

CREATE TABLE public.professors (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  department_id uuid,
  first_name text NOT NULL,
  last_name text NOT NULL,
  email text NOT NULL UNIQUE,
  phone text,
  is_active boolean NOT NULL DEFAULT true,
  max_surveillances_per_week integer NOT NULL DEFAULT 4,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT professors_pkey PRIMARY KEY (id),
  CONSTRAINT professors_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);

CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  building text,
  floor integer,
  capacity integer DEFAULT 30,
  room_type public.room_type NOT NULL DEFAULT 'classroom'::public.room_type,
  has_projector boolean DEFAULT false,
  has_computers boolean DEFAULT false,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT rooms_pkey PRIMARY KEY (id)
);

CREATE TABLE public.modules (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  code text NOT NULL UNIQUE,
  department_id uuid,
  professor_id uuid,
  credits integer NOT NULL DEFAULT 3,
  semester integer CHECK (semester >= 1 AND semester <= 2),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT modules_pkey PRIMARY KEY (id),
  CONSTRAINT modules_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id),
  CONSTRAINT modules_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id)
);

CREATE TABLE public.student_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  code text NOT NULL UNIQUE,
  level text,
  student_count integer DEFAULT 0,
  department_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT student_groups_pkey PRIMARY KEY (id),
  CONSTRAINT student_groups_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments(id)
);

CREATE TABLE public.exams (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  module_id uuid NOT NULL,
  room_id uuid,
  date date NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  duration_minutes integer DEFAULT 120,
  status public.exam_status DEFAULT 'scheduled'::public.exam_status,
  student_count integer,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  professor_id uuid,
  CONSTRAINT exams_pkey PRIMARY KEY (id),
  CONSTRAINT exams_module_id_fkey FOREIGN KEY (module_id) REFERENCES public.modules(id),
  CONSTRAINT exams_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id),
  CONSTRAINT exams_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id)
);

CREATE TABLE public.professor_availability (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  professor_id uuid NOT NULL,
  day_of_week public.day_of_week NOT NULL,
  start_time time without time zone NOT NULL,
  end_time time without time zone NOT NULL,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT professor_availability_pkey PRIMARY KEY (id),
  CONSTRAINT professor_availability_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id)
);

CREATE TABLE public.surveillances (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL,
  professor_id uuid NOT NULL,
  is_primary boolean DEFAULT false,
  status public.surveillance_status DEFAULT 'assigned'::public.surveillance_status,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT surveillances_pkey PRIMARY KEY (id),
  CONSTRAINT surveillances_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id),
  CONSTRAINT surveillances_professor_id_fkey FOREIGN KEY (professor_id) REFERENCES public.professors(id)
);

CREATE TABLE public.exam_groups (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  exam_id uuid NOT NULL,
  group_id uuid NOT NULL,
  CONSTRAINT exam_groups_pkey PRIMARY KEY (id),
  CONSTRAINT exam_groups_exam_id_fkey FOREIGN KEY (exam_id) REFERENCES public.exams(id),
  CONSTRAINT exam_groups_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.student_groups(id)
);
