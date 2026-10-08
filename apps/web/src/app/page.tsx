import { Explorer } from "@/components/Explorer";
import { getAds, getCities, getPlaces } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default async function Home() {
  const [places, ads, cities] = await Promise.all([getPlaces(), getAds(), getCities()]);
  return <Explorer places={places} ads={ads} cities={cities} demo={!isSupabaseConfigured} />;
}
