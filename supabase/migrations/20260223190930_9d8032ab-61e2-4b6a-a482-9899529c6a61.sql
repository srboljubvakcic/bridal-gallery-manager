CREATE POLICY "Anyone can submit testimonials"
ON public.testimonials FOR INSERT
WITH CHECK (is_active = false);