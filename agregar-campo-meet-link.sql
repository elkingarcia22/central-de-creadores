-- Agregar campo para enlace de Google Meet
ALTER TABLE public.reclutamientos 
ADD COLUMN IF NOT EXISTS meet_link TEXT;

-- Agregar comentario al campo
COMMENT ON COLUMN public.reclutamientos.meet_link IS 'Enlace de Google Meet para la sesión';
