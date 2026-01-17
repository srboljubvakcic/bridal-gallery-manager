-- Create site_settings table for admin to control all site content
CREATE TABLE public.site_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can view settings (for frontend)
CREATE POLICY "Site settings are viewable by everyone" 
ON public.site_settings 
FOR SELECT 
USING (true);

-- Admins can manage settings
CREATE POLICY "Admins can manage site settings" 
ON public.site_settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default settings
INSERT INTO public.site_settings (key, value) VALUES
('hero', '{"title": "Čuvam Vašu", "title_accent": "Vječnost", "subtitle": "Fotografija Vjenčanja", "description": "Čuvam najljepše trenutke vašeg posebnog dana s umjetničkom elegancijom i bezvremenskom gracioznošću.", "image": "", "cta_text": "Kontaktirajte me", "cta_secondary_text": "Pogledaj galeriju"}'),
('about', '{"name": "Ana", "title": "Zdravo, ja sam Ana", "description": "Već više od 8 godina s ljubavlju bilježim priče o ljubavi. Moj pristup kombinuje dokumentarni stil s umjetničkim portretima, osiguravajući da svaka emocija i detalj budu lijepo sačuvani.", "description2": "Svako vjenčanje je jedinstveno, i vjerujem da vaše fotografije trebaju to odražavati. Fokusiram se na autentične trenutke, prave emocije i male detalje koji čine vaš dan posebnim.", "image": ""}'),
('contact', '{"email": "info@anafotografija.com", "phone": "+387 61 234 567", "address": "Sarajevo, Bosna i Hercegovina", "address_note": "Dostupna za putovanja širom regije", "instagram": "https://instagram.com", "facebook": "https://facebook.com"}'),
('cta', '{"subtitle": "Spremni ste?", "title": "Započnimo Vašu Priču", "description": "Vaša ljubavna priča zaslužuje da bude ispričana. Kontaktirajte me da razgovaramo o vašem posebnom danu i kako ga mogu učiniti nezaboravnim.", "button_text": "Rezervirajte Termin"}'),
('footer', '{"brand_name": "Ana Fotografija", "description": "Profesionalna fotografija vjenčanja. Bilježim vaše najljepše trenutke s pažnjom prema detaljima i emocijama."}');

-- Create trigger for updating timestamp
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();